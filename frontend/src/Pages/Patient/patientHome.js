import { useEffect, useState } from 'react';
import PatientSideBar from "../../Components/patientSideBar";

import Web3 from 'web3';
import Cont from '../../abis/Health.json'

function Patient() {

    const [account, setAccount] = useState();
    const [name, setName] = useState("");    

    useEffect(() => {
      async function load() {
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const networkData = Cont.networks[networkId];
        if(networkData) {
          const contract = new web3.eth.Contract(Cont.abi, networkData.address);
          const patient = await contract.methods.get_patient(accounts[0]).call({ from: accounts[0] });
          setName(patient[0]);
        } else {
          window.alert('Contrato inteligente no ha sido desplegado en la red detectada.')
        }
      }
      
      load();
     }, []);

    return (
      <>
        <div className='abs_patient_div'>
          <div className='main-data_patient'>
            <h1>Cuenta paciente</h1>
            <p>Bienvenido: {name} - {account}</p>
          </div>

          <div>
            <PatientSideBar name={name}/>
          </div>

        </div> 
        <div className='main-container-patient'>
        </div>
      </>
    );
}
  
export default Patient;