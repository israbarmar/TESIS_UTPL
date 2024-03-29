import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { useNavigate } from "react-router-dom";
import Cont from './abis/Health.json'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { BiError }from "react-icons/bi";
import { FaRegAddressCard }from "react-icons/fa";
import { RiLockPasswordLine }from "react-icons/ri";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

function Login() {
  
  const [account, setAccount] = useState();
  const [password, setPassword] = useState("");
  const [contract, setContract] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const networkData = Cont.networks[networkId];
      if(networkData) {
        const contract = new web3.eth.Contract(Cont.abi, networkData.address);
        setContract(contract);
      } else {
        window.alert('Contrato inteligente no ha sido desplegado en la red detectada.')
      }
    }
    
    load();
   }, []);


   const updateText = (e) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowAlert(false);
    const pass = await contract.methods.getPassword().call({ from: account });

    if(pass==="") {
      setAlertMsg("Address no encontrada");
      setShowAlert(true);
    }
    else if(pass===password) {
      const role = await contract.methods.getRole().call({ from: account });
      if(Number(role)===0) {
        localStorage.setItem('account',account);
        localStorage.setItem('role','Patient');
        navigate("/home");
      } else {
        localStorage.setItem('account',account);
        localStorage.setItem('role','Doctor');
        navigate("/home");
      }
    }
    else {
      setAlertMsg("Contraseña incorrecta");
      setShowAlert(true);
    }
    setPassword("");
  };

  return (
     <div className='Login_box'>
      <div className="LoginContainer">
        <div className="LoginContents">

          <div className='title_name'>
            <h3 style={{color : '#2874A6'}}>Login</h3>
        </div>

        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4 mt-4" controlId="formBasicEmail">
                <Form.Label>
                  <FaRegAddressCard size={24}/>
                  <span style={{marginLeft : '10px'}}>Dirección</span>
                </Form.Label>
                <Form.Control type="text" placeholder={account} disabled/>
                <Form.Text className="text-muted">
                <span>Ingrese la dirección enlazada a Metamask</span>
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>
                  <RiLockPasswordLine size={24}/>
                  <span style={{marginLeft : '10px'}}>Contraseña</span>
                </Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={updateText}/>
            </Form.Group>
            {showAlert?
            <Alert variant="danger"><BiError size={20}/><span>{alertMsg}</span></Alert>
            :
            <div style={{height : '25px'}}></div>}
            <div className="d-grid mx-5 mt-4">
                <Button className='btn btn-primary' type="submit">
                    Ingresar
                </Button>
            </div>
          </Form>
        </div>
      </div>
      </div>
   );
}

export default Login;

