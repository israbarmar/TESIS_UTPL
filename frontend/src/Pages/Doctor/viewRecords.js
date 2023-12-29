import DoctorSideBar from "../../Components/doctorSideBar";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import { BiError } from "react-icons/bi";
import emailjs from "@emailjs/browser";
import Cont from "../../abis/Health.json";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import '../Patient/Patient.css';

function ViewRecords() {
  const [account, setAccount] = useState();
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [addr, setAddr] = useState("");
  const [record, setRecord] = useState([]);
  const [patName, setPatName] = useState("");
  const [showTable, setShowTable] = useState(false);

  const [showAlert, setShowAlert] = useState(false);

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
        window.alert("El contrato inteligente no ha sido desplegado en la red detectada.");
      }
    }

    load();
  }, [navigate]);

  const updateAddr = (e) => {
    e.preventDefault();
    setAddr(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let plist = await contract.methods.get_accessible_patients().call({ from: account });
    let patient = [];
    try {
      patient = await contract.methods.get_patient(addr).call({ from: account });
    } catch (error) {
      console.log(error);
    }
    if (!plist.includes(addr)) {
      setShowTable(false);
      setShowAlert(true);

      if (patient.length !== 0) {
        let templateParams = {
          subject: "Solicitud de acceso",
          pat_name: patient[0],
          pat_email: patient[2],
          message:
            name +
            " solicita acceso a su historial médico. Para conceder el acceso, vaya a la sección Gestionar el acceso y utilice la dirección " +
            localStorage.getItem("account"),
        };
        console.log(templateParams);

        emailjs.send("service_8t0cihe", "template_tdfhmes", templateParams, "etF0DumPZKLU2Dhug").then(
          (result) => {
            console.log(result.text);
            e.target.reset();
          },
          (error) => {
            console.log(error.text);
          }
        );
      }
    } else {
      setShowAlert(false);
      let records = await contract.methods.get_patient_records(addr).call({ from: account });
      if (records.length > 0) setShowTable(true);
      setRecord(records);
      setPatName(patient[0]);
    }

    e.target.reset();
  };

  return (
    <>
      <DoctorSideBar name={name} />
      <div className="main-container-mRecords">
        <div className="main-body-mRecords">
          <div>
            <h1 style={{ fontVariant: "small-caps" }}>Ver Historias Clinicas</h1>
          </div>
          <div>
            <Form onSubmit={handleSubmit}>
              <div className="contents_access_records"> 
                    <Form.Control type="text" placeholder="Ingresar Address del paciente" onChange={updateAddr} /> 
                    <Button variant="primary" type="submit" style={{margin:'1em 0em'}}>
                      Ver H. Clinica
                    </Button>         
              </div>
            </Form>
            {showTable ? (
              <h4>
                <span style={{ fontWeight: "bold"}}>Nombre del paciente :</span> {patName}
              </h4>
            ) : (
              <></>
            )}
          </div>
          {showAlert ? (
            <Alert variant="danger" style={{marginTop: "10px"}}>
              <BiError size={20} />
              <span style={{ marginLeft: "10px" }}>No tiene acceso al historial clinico del paciente</span>
            </Alert>
          ) : (
            <></>
          )}

          {showTable ? (
            <div className="table">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Diagnóstico</th>
                    <th>Tratamiento</th>
                    <th>Prescripción</th>
                    <th>Archivos</th>
                  </tr>
                </thead>
                <tbody>
                  {record.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item[0]}</td>
                      <td>{item[2]}</td>
                      <td>{item[3]}</td>
                      <td>{item[4]}</td>
                      <td>
                        {item[5].map((l, i) => (
                          <a href={l} key={i} target="_blank" rel="noreferrer noopener">
                            Archivo {i}
                          </a>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
  
}

export default ViewRecords;
