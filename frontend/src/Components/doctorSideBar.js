import { BsClipboard2Data }from "react-icons/bs";
import { TbCalendarTime }from "react-icons/tb";
import { HiOutlineDocumentAdd }from "react-icons/hi";
import { BsPersonAdd }from "react-icons/bs";
import { FaUserCircle }from "react-icons/fa";
import { BiLogOut }from "react-icons/bi";
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import './sidebar.css';

function DoctorSideBar(props) {

    const navigate = useNavigate();

    const menuItem=[
        {
            path:"/manageAppointments",
            name:"Consultas",
            icon:<TbCalendarTime />
        },
        {
            path:"/addpatient",
            name:"Añadir Paciente",
            icon:<BsPersonAdd />
        },
        {
            path:"/viewrecords",
            name:"Ver Historias Clinicas",
            icon:<BsClipboard2Data />
        },
        {
            path:"/addrecords",
            name:"Añadir Historias Clinicas",
            icon:<HiOutlineDocumentAdd />
        },
    ]

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.clear();
        navigate("/");
    };

    return (
            <div className="sidebar_contents_doctor">
           {
               menuItem.map((item, index)=>(
                   
                        <NavLink to={item.path} key={index} className={(navData) => (navData.isActive ? "active" : "inactive")}>
                            <div className="icon">{item.icon}</div>
                            <div className="link_text"><span style={{fontVariant : 'small-caps'}}>{item.name}</span></div>
                        </NavLink>
                   
               ))
           }
          
                <a href="/#" onClick={handleSubmit}>
                    <div className="icon"><BiLogOut /></div>
                    <div className="link_text"><span style={{fontVariant : 'small-caps'}}>Salir</span></div>
                </a>
            
            </div>
    );
};

export default DoctorSideBar;