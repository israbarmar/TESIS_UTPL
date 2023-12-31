import DoctorSideBar from "../../Components/doctorSideBar";
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { BiErrorCircle } from "react-icons/bi";
import Cont from "../../abis/Health.json";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import './Doctor.css';

function AddPatient() {
  const [account, setAccount] = useState();
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");

  const [id_patient, setIdPatient] = useState(0);
  const [pName, setPname] = useState("");
  const [pEmail, setPemail] = useState("");
  const [pAge, setPAge] = useState(0);

  const [errors, setErrors] = useState({
    id_patient: "",
    name: "",
    email: "",
    age: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!localStorage.getItem("account") || localStorage.getItem("role") !== "Doctor") navigate("/");
      const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const networkData = Cont.networks[networkId];
      if (networkData) {
        const contract = new web3.eth.Contract(Cont.abi, networkData.address);
        setContract(contract);
        const doctor = await contract.methods.get_doctor(accounts[0]).call({ from: accounts[0] });
        setName(doctor[1]);
      } else {
        window.alert("Contrato inteligente no ha sido desplegado en la red detectada.");
      }
    }

    load();
  }, [navigate]);

  const updateIdPatient = (e) => {
    e.preventDefault();
    setErrors({ ...errors, id_patient: "t" });
    if (e.target.value.length === 10) setErrors({ ...errors, id_patient: "f" });
    setIdPatient(e.target.value);
  };

  const updateName = (e) => {
    e.preventDefault();
    setErrors({ ...errors, name: "t" });
    if (e.target.value.length > 2) setErrors({ ...errors, name: "f" });
    setPname(e.target.value);
  };

  const updateEmail = (e) => {
    e.preventDefault();
    setErrors({ ...errors, email: "t" });
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (emailPattern.test(e.target.value)) setErrors({ ...errors, email: "f" });
    setPemail(e.target.value);
  };

  const updateAge = (e) => {
    e.preventDefault();
    setErrors({ ...errors, age: "t" });
    if (e.target.value < 120) setErrors({ ...errors, age: "f" });
    setPAge(e.target.value);
  };

  const generatePassword = () => {
    var text = "";
    var char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
      text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key in errors) {
      if (`${errors[key]}` === "" || `${errors[key]}` === "t") return;
    }
    let success = false;
    let pAddress, pKey, pPass;
    let dlist = await contract.methods.get_existing_id_patients().call({ from: account });

    if (dlist.includes(id_patient.toString())) {
      window.alert("El paciente ya existe");
      e.target.reset();
      setIdPatient(0);
      setPname("");
      setPemail("");
      setPAge(0);
      return;
    }
    
    pPass = generatePassword().toString();
    console.log(pPass);
    await contract.methods
      .add_patient(id_patient.toString(), pName, pEmail, pAge, pPass)
      .send({ from: account })
      .then((r) => {
        success = true;
      });
    e.target.reset();
    if (success) {
      let details = await contract.methods.get_addressKey().call({ from: account });
      pAddress = details[0];
      pKey = details[1];

      let templateParams = {
        pat_name: pName,
        pat_email: pEmail,
        pat_address: pAddress,
        pat_key: pKey,
        pat_password: pPass,
      };
      console.log(templateParams);

      emailjs.send("service_8t0cihe", "template_dpks6pn", templateParams, "etF0DumPZKLU2Dhug").then(
        (result) => {
          console.log(result.text);
          e.target.reset();
        },
        (error) => {
          console.log(error.text);
        }
      );
    }
    setIdPatient(0);
    setPname("");
    setPemail("");
    setPAge(0);
  };

  return (
    <>

    <div className="header_menu">
      <DoctorSideBar />
      </div>

      <div className="container-aPatient">

        <div className="add-patient">
        <div className="container-patient">
          <div> 
            <h1 style={{ fontVariant: "small-caps" }}>Añadir Paciente</h1>
          </div>
          <div>
            <Form onSubmit={handleSubmit}>  
                <h3 style={{ fontVariant: "small-caps" }}>Detalles del paciente</h3>
              <Form.Group className="mb-3" controlId="formBasicId">
                <Form.Label>N° Cédula</Form.Label>
                <Form.Control type="number" placeholder="" onChange={updateIdPatient} />
                {errors.id_patient === "t" ? (
                  <span style={{ color: "red", fontSize: "12px"}}>
                    {" "}
                    <BiErrorCircle /> La n° de cédula debe tener 10 dígitos
                  </span>
                ) : (
                  <></>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" autoComplete="off" placeholder="Enter name" onChange={updateName} />
                {errors.name === "t" ? (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {" "}
                    <BiErrorCircle /> Ingrese un nombre válido
                  </span>
                ) : (
                  <></>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>E-mail</Form.Label>
                <Form.Control type="email" placeholder="Enter email" onChange={updateEmail} />
                {errors.email === "t" ? (
                  <span style={{ color: "red", fontSize: "12px"}}>
                    {" "}
                    <BiErrorCircle /> Ingrese un e-mail válido
                  </span>
                ) : (
                  <></>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicAge">
                <Form.Label>Edad</Form.Label>
                <Form.Control type="number" placeholder="" onChange={updateAge} />
                {errors.age === "t" ? (
                  <span style={{ color: "red", fontSize: "12px"}}>
                    {" "}
                    <BiErrorCircle /> Ingrese una edad válida
                  </span>
                ) : (
                  <></>
                )}
              </Form.Group>
            <div className="b_add">
              <Button variant="primary" type="submit">
                Añadir Paciente
              </Button>
            </div>
            </Form>
          </div>
        </div>
      </div>
      
    </div>
    </>
  );
}

export default AddPatient;
