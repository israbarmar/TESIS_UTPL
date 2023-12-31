import DoctorSideBar from "../../Components/doctorSideBar";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Cont1 from "../../abis/Health.json";
import Cont2 from "../../abis/Appointment.json";
import Web3 from "web3";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import './Doctor.css';

function ManageAppointments() {
  const [account, setAccount] = useState();
  const [name, setName] = useState("");
  const [healthContract, setHealthContract] = useState(null);
  const [appointmentContract, setAppointmentContract] = useState(null);

  const [time, setTime] = useState("");
  const [requests, setRequests] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [confirmed, setConfirmed] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [idx, setIdx] = useState(null);
  const [reason, setReason] = useState("");
  const [cancel, setCancel] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!localStorage.getItem("account") || localStorage.getItem("role") !== "Doctor") navigate("/");
      const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const networkData1 = Cont1.networks[networkId];
      const networkData2 = Cont2.networks[networkId];
      if (networkData1) {
        const healthContract = new web3.eth.Contract(Cont1.abi, networkData1.address);
        setHealthContract(healthContract);
        const appointmentContract = new web3.eth.Contract(Cont2.abi, networkData2.address);
        setAppointmentContract(appointmentContract);

        const doctor = await healthContract.methods.get_doctor(accounts[0]).call({ from: accounts[0] });
        setName(doctor[1]);
        const requests = await appointmentContract.methods.get_pending_requests().call({ from: accounts[0] });
        setRequests(requests);
        if (requests.length > 0) setShowTable(true);
        const confirmed = await appointmentContract.methods.get_confirmed_appointments().call({ from: accounts[0] });
        setConfirmed(confirmed);
        if (confirmed.length > 0) setShowConfirm(true);
      } else {
        window.alert("No se ha desplegado el contrato inteligente en la red detectada");
      }
    }

    load();
  }, [navigate]);

  const updateReason = (e) => {
    e.preventDefault();
    setReason(e.target.value);
  };

  const updateTime = (e) => {
    e.preventDefault();
    var splitTime = e.target.value.split(":");
    var hh = splitTime[0];
    var mm = splitTime[1];

    let AMorPM = "AM";
    if (hh >= 12) AMorPM = "PM";
    hh = hh === "12" ? hh : hh % 12;

    setTime(hh + ":" + mm + " " + AMorPM);
  };

  const handleConfirm = async (index) => {
    if (time === "") {
      window.alert("Seleccione la hora");
      return;
    }
    let req = requests[index];
    let success = false;
    await appointmentContract.methods
      .confirm_appointment(index, time)
      .send({ from: account })
      .then((r) => {
        success = true;
      });

    if (success) {
      const pat = await healthContract.methods.get_patient(req[2]).call({ from: account });
      let templateParams = {
        subject: "Solicitud de consulta médica: aprobada",
        pat_name: req[3],
        pat_email: pat[2],
        message: "Su consulta con " + req[5] + " está confirmado para el día " + req[0] + " a las " + time,
      };
      console.log(templateParams);

      emailjs.send("service_8t0cihe", "template_tdfhmes", templateParams, "etF0DumPZKLU2Dhug").then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );

      const requests = await appointmentContract.methods.get_pending_requests().call({ from: account });
      setRequests(requests);
      if (requests.length === 0) setShowTable(false);
      const confirmed = await appointmentContract.methods.get_confirmed_appointments().call({ from: account });
      setConfirmed(confirmed);
      if (confirmed.length > 0) setShowConfirm(true);
    }
  };

  const handleReject = (index) => {
    setIdx(index);
    setCancel(false);
    setShowModal(true);
  };

  const rejectRequest = async () => {
    let req = requests[idx];
    let success = false;
    await appointmentContract.methods
      .reject_pending_request(idx)
      .send({ from: account })
      .then((r) => {
        success = true;
      });

    if (success) {
      const pat = await healthContract.methods.get_patient(req[2]).call({ from: account });
      let templateParams = {
        subject: "Solicitud de la consulta médica: rechazada",
        pat_name: req[3],
        pat_email: pat[2],
        message: "Su consulta con " + req[5] + " para el día " + req[0] + " fue rechazado. Motivo : " + reason,
      };
      console.log(templateParams);

      emailjs.send("service_8t0cihe", "template_tdfhmes", templateParams, "etF0DumPZKLU2Dhug").then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );

      const requests = await appointmentContract.methods.get_pending_requests().call({ from: account });
      setRequests(requests);
      if (requests.length === 0) setShowTable(false);
    }
    setShowModal(false);
  };

  const handleCancel = (index) => {
    setIdx(index);
    setCancel(true);
    setShowModal(true);
  };

  const cancelAppointment = async () => {
    let conf = confirmed[idx];
    let success = false;
    await appointmentContract.methods
      .cancel_confirmed_appointment(idx)
      .send({ from: account })
      .then((r) => {
        success = true;
      });

    if (success) {
      const pat = await healthContract.methods.get_patient(conf[2]).call({ from: account });
      let templateParams = {
        subject: "Solicitud de consulta médica: cancelada",
        pat_name: conf[3],
        pat_email: pat[2],
        message:
          "Su consulta con " + conf[5] + " a las " + conf[0] + " " + conf[1] + " ha sido cancelada. Motivo : " + reason,
      };
      console.log(templateParams);

      emailjs.send("service_8t0cihe", "template_tdfhmes", templateParams, "etF0DumPZKLU2Dhug").then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );

      const confirmed = await appointmentContract.methods.get_confirmed_appointments().call({ from: account });
      setConfirmed(confirmed);
      if (confirmed.length === 0) setShowConfirm(false);
    }
    setShowModal(false);
  };

  const handleDone = async (index) => {
    let success = false;

    await appointmentContract.methods
      .mark_as_complete(index)
      .send({ from: account })
      .then((r) => {
        success = true;
      });

    if (success) {
      const confirmed = await appointmentContract.methods.get_confirmed_appointments().call({ from: account });
      setConfirmed(confirmed);
      if (confirmed.length === 0) setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="container-appointment">

      <div className="header_menu">
      <DoctorSideBar />
      </div>
      
      <div className='container_apm'>
        <div className="apm-doctor">
            
        <div className="req_app">
        <h1 style={{ fontVariant: "small-caps" }}>Consultas</h1>
            <h4 style={{ fontVariant: "small-caps" }}>Peticiones</h4>
          <div className="table">
            {showTable ? (
              <>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Nombre Paciente</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item[0]}</td>
                        <td>{item[3]}</td>
                        <td>{item[6]}</td>
                        <td>
                          <Form>
                            <Row style={{ height: "auto" }}>
                              <Col xs="auto">
                                <Form.Control type="time" onChange={updateTime} />
                              </Col>
                              <Col xs="auto">
                                <Button variant="primary" size="sm" onClick={() => handleConfirm(index)}>
                                  {" "}
                                  Confirmar{" "}
                                </Button>
                              </Col>
                              <Col xs="auto">
                                <Button variant="outline-danger" size="sm" onClick={() => handleReject(index)}>
                                  {" "}
                                  Rechazar{" "}
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            ) : (
              <p style={{fontStyle: "italic"}}>Sin Peticiones</p>
            )}
          </div>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{cancel === true ? <>Cancelar Consulta</> : <>Rechazar Pedido</>}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Motivo</Form.Label>
                  <Form.Control as="textarea" rows={2} onChange={updateReason} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              {cancel === true ? (
                <Button variant="danger" onClick={cancelAppointment}>
                  Cancelar Consulta
                </Button>
              ) : (
                <Button variant="danger" onClick={rejectRequest}>
                  Rechazar
                </Button>
              )}
            </Modal.Footer>
          </Modal>
          </div>

          <div className='app_accepted'>
            <h4 style={{fontVariant: "small-caps"}}>Confirmados</h4>
          <div className="table">
            {showConfirm ? (
              <>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Nombre Paciente</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmed.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item[0]}</td>
                        <td>{item[1]}</td>
                        <td>{item[3]}</td>
                        <td>{item[6]}</td>
                        <td>
                          <Row style={{ height: "auto" }}>
                            <Col xs="auto">
                              <Button variant="outline-danger" size="sm" onClick={() => handleCancel(index)}>
                                {" "}
                                Cancelar{" "}
                              </Button>
                            </Col>
                            <Col xs="auto">
                              <Button variant="outline-success" size="sm" onClick={() => handleDone(index)}>
                                {" "}
                                Hecho{" "}
                              </Button>
                            </Col>
                          </Row>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            ) : (
              <p style={{ fontStyle: "italic"}}>Sin consultas confirmadas</p>
            )}
          </div>
        </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default ManageAppointments;
