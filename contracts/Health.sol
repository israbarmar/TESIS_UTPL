// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Health {
    struct user {
        address addr;
        string password;
        uint categ;
    }

   struct record {
        string date;
        address doctor;
        string diagnosis;
        string description;
        string prescription;
        string[] files;
    }

   struct patient {
        string id_patient;
        string name;
        string email;
        uint age;
        address[] doctorAccessList;
        mapping(uint => record) recordMap;
        uint recordSize;
    }

    struct doctor {
        address addr;
        string name;
        string hospital;
        string specialization;
        uint age;
        address[] patientAccessList;
    }

    mapping(address => user) USERS;
    mapping(address => patient) public PATIENTS;
    mapping(address => doctor) public DOCTORS;

    string[] id_patient;

    string[2] private_keys = [
        "0x2d7469d20167fb4ffd846d79aca11226825d40db7e5527dc310dc138ebb58b25",
        "0x6761e26e24552d334b1c9d2089cedb2717cdf0a3f2294ab093ca86591262d8a7"
    ];
    address[2] addresses = [
        0x106E09A804824D3D62e506a143aC3Faeb6e20057,
        0xedFd4001288dA0e493927E4033BE7b2465475622
    ];

    // variable para llevar la cuenta de pacientes y médicos
    uint public patientCount = 0;
    uint public doctorCount = 0;

    /* FUNCIONES DE UTILIDAD */

    function compare(
        string memory str1,
        string memory str2
    ) public pure returns (bool) {
        return
            keccak256(abi.encodePacked(str1)) ==
            keccak256(abi.encodePacked(str2));
    }

    /* MÓDULO DE AUTENTICACIÓN */

    function add_doctor(
        address _addr,
        string memory _name,
        string memory _hospital,
        string memory _special,
        uint _age,
        string memory _password
    ) public {
        require(
            USERS[_addr].addr != _addr,
            "Esta direccion ya ha sido registrada"
        );
        USERS[_addr].addr = _addr;
        USERS[_addr].password = _password;
        USERS[_addr].categ = 1;

        doctorCount++;
        DOCTORS[_addr].addr = _addr;
        DOCTORS[_addr].hospital = _hospital;
        DOCTORS[_addr].specialization = _special;
        DOCTORS[_addr].name = _name;
        DOCTORS[_addr].age = _age;
    }

    function add_patient(
        string memory _id_patient,
        string memory _name,
        string memory _email,
        uint _age,
        string memory _password
    ) public {
        // obtener la dirección y la clave privada del paciente
        i = 0;
        while (i < addresses.length) {
            if (compare("", USERS[addresses[i]].password)) {
                break;
            }
            i++;
        }

        require(i < addresses.length, "Fuera de las direcciones posibles");
        USERS[addresses[i]].addr = addresses[i];
        USERS[addresses[i]].password = _password;
        USERS[addresses[i]].categ = 0;

        patientCount++;
        id_patient.push(_id_patient);
        PATIENTS[addresses[i]].id_patient = _id_patient;
        PATIENTS[addresses[i]].name = _name;
        PATIENTS[addresses[i]].age = _age;
        PATIENTS[addresses[i]].email = _email;
        PATIENTS[addresses[i]].recordSize = 0;

        set_i(i);
    }

    uint i;

    function set_i(uint x) private {
        i = x;
    }

    // obtiene la dirección y la clave privada del paciente recién creado
    function get_addressKey() public view returns (address, string memory) {
        return (addresses[i], private_keys[i]);
    }

    function getPassword() public view returns (string memory) {
        address _addr = msg.sender;
        return USERS[_addr].password;
    }

    function getRole() public view returns (uint) {
        address _addr = msg.sender;
        return USERS[_addr].categ;
    }

    function get_existing_id_patients() public view returns (string[] memory) {
        return id_patient;
    }

    function login(string memory _password) public view returns (uint) {
        address _addr = msg.sender;
        // comprobar si existe una cuenta con la dirección indicada
        require(
            compare("", USERS[_addr].password),
            "Cuenta no encontrada. Registrese primero"
        );
        // comprobar si msg.sender (persona que se está conectando actualmente con el contrato) 
        //es el propietario de la cuenta
        require(
            USERS[_addr].addr == msg.sender,
            "No puede acceder a esta cuenta"
        );
        // comprobar si la contraseña almacenada y la escrita coinciden
        require(
            compare(USERS[_addr].password, _password),
            "La contrasena no coincide"
        );
        // devolver la categoría del usuario
        return USERS[_addr].categ;
    }

    function get_patient(
        address _addr
    ) public view returns (string memory, uint, string memory email) {
        return (
            PATIENTS[_addr].name,
            PATIENTS[_addr].age,
            PATIENTS[_addr].email
        );
    }

    function get_doctor(
        address _addr
    )
        public
        view
        returns (address, string memory, string memory, string memory, uint)
    {
        return (
            DOCTORS[_addr].addr,
            DOCTORS[_addr].name,
            DOCTORS[_addr].hospital,
            DOCTORS[_addr].specialization,
            DOCTORS[_addr].age
        );
    }

    /* MÓDULO DE GESTIÓN DE ACCESO */

    function permit_access(address addr) public payable {
        DOCTORS[addr].patientAccessList.push(msg.sender);
        PATIENTS[msg.sender].doctorAccessList.push(addr);
    }

    function revoke_access(address daddr) public payable {
        address patientAddr = msg.sender;
        address doctorAddr = daddr;

        // eliminar la dirección del paciente de la lista de acceso del médico
        address[] storage arr = DOCTORS[doctorAddr].patientAccessList;
        remove_element_from_array(arr, patientAddr);

        //eliminar la dirección del médico de la lista de acceso de los pacientes
        arr = PATIENTS[patientAddr].doctorAccessList;
        remove_element_from_array(arr, doctorAddr);

    }

    function remove_element_from_array(
        address[] storage arr,
        address addr
    ) private {
        // buscar el índice de esta dirección en el arreglo
        bool found = false;
        uint target_index = 0;
        for (uint j = 0; j < arr.length; j++) {
            if (arr[j] == addr) {
                found = true;
                target_index = j;
                break;
            }
        }
        // si no se encuentra, la acción se revierte
        if (!found) revert("Direccion no encontrada en la lista");
        else {
            if (arr.length == 1) arr.pop();
            else {
                arr[target_index] = arr[arr.length - 1];
                arr.pop();
            }
        }
    }

    function get_permitted_doctors() public view returns (address[] memory) {
        address addr = msg.sender;
        return PATIENTS[addr].doctorAccessList;
    }

    function get_accessible_patients() public view returns (address[] memory) {
        address addr = msg.sender;
        return DOCTORS[addr].patientAccessList;
    }

    /* MÓDULO DE INTERCAMBIO DE DATOS */

    function add_patient_record(
        address patientAddr,
        string memory _date,
        string memory _diagnosis,
        string memory _description,
        string memory _prescription,
        string[] memory _files
    ) public {
        patient storage p = PATIENTS[patientAddr];

        p.recordMap[p.recordSize] = record(
            _date,
            msg.sender,
            _diagnosis,
            _description,
            _prescription,
            _files
        );
        p.recordSize++;
    }

    function get_patient_records(
        address patientAddr
    ) public view returns (record[] memory) {
        record[] memory records = new record[](
            PATIENTS[patientAddr].recordSize
        );
        for (uint k = 0; k < PATIENTS[patientAddr].recordSize; k++) {
            records[k] = PATIENTS[patientAddr].recordMap[k];
        }
        return records;
    }
    
}