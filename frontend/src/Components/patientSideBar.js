
import { TbStethoscope }from "react-icons/tb";
import { BiLogOut }from "react-icons/bi";
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import './sidebar.css'

function PatientSideBar(props) {

    const navigate = useNavigate();

    const menuItem=[
        {
            path:"/appointment",
            name:"Consultas",
            icon:<TbStethoscope />
        }
    ]

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.clear();
        navigate("/");
    };

    return (
            <div className="sidebar_contents">
           {
               menuItem.map((item, index)=>(
                   <div key={index} className="row">
                        <NavLink to={item.path} key={index} className={(navData) => (navData.isActive ? "active" : "inactive")}>
                            <div className="icon">{item.icon}</div>
                            <div className="link_text"><span style={{fontVariant : 'small-caps'}}>{item.name}</span></div>
                        </NavLink>
                   </div>
               ))
           }
         
                <a href="/#" onClick={handleSubmit}>
                    <div className="icon"><BiLogOut /></div>
                    <div className="link_text"><span style={{fontVariant : 'small-caps'}}>Salir</span></div>
                </a>
            </div>

    );
};

export default PatientSideBar;