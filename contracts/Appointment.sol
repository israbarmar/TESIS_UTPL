// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Appointment {
    /* ESTRUCTURAS DE DATOS */

    struct appointment {
        string date;
        string time;
        address patient;
        string patient_name;
        address doctor;
        string doctor_name;
        string status;
    }

    mapping(address => appointment[]) public PATIENTS;
    mapping(address => appointment[]) public DOCTORS;

    /* FUNCIONES DE UTILIDAD */

    function compare(
        string memory str1,
        string memory str2
    ) public pure returns (bool) {
        return
            keccak256(abi.encodePacked(str1)) ==
            keccak256(abi.encodePacked(str2));
    }

    function get_count(
        uint _role,
        string memory _filter,
        address _addr
    ) private view returns (uint) {
        uint count = 0;
        if (_role == 0) {
            // paciente
            for (uint i = 0; i < PATIENTS[_addr].length; i++) {
                if (compare(PATIENTS[_addr][i].status, _filter)) {
                    count++;
                }
            }
        } else {
            // doctor
            for (uint i = 0; i < DOCTORS[_addr].length; i++) {
                if (compare(DOCTORS[_addr][i].status, _filter)) {
                    count++;
                }
            }
        }
        return count;
    }

    function find_doctor_actual_index(
        uint _index,
        string memory _filter
    ) private view returns (uint) {
        uint count = 0;
        uint pos = 0;
        for (uint i = 0; i < DOCTORS[msg.sender].length; i++) {
            if (compare(DOCTORS[msg.sender][i].status, _filter)) {
                count++;
                if ((count - 1) == _index) {
                    pos = i;
                    break;
                }
            }
        }
        return pos;
    }

    function find_patient_actual_index(
        uint _index,
        string memory _filter
    ) private view returns (uint) {
        uint count = 0;
        uint pos = 0;
        for (uint i = 0; i < PATIENTS[msg.sender].length; i++) {
            if (compare(PATIENTS[msg.sender][i].status, _filter)) {
                count++;
                if ((count - 1) == _index) {
                    pos = i;
                    break;
                }
            }
        }
        return pos;
    }

    // eliminar cita en la lista de médicos de forma iterativa
    function iterative_delete(uint _index, address _doctor) private {
        for (uint i = _index; i < DOCTORS[_doctor].length - 1; i++) {
            DOCTORS[_doctor][i] = DOCTORS[_doctor][i + 1];
        }
        DOCTORS[_doctor].pop();
    }

    // eliminar cita en la lista de médicos cuando el paciente borra su solicitud o cancela su cita
    function delete_appointment(
        address _doctor,
        address _patient,
        string memory _date
    ) private {
        uint target = DOCTORS[_doctor].length + 4;
        for (uint i = 0; i < DOCTORS[_doctor].length; i++) {
            if (
                DOCTORS[_doctor][i].patient == _patient &&
                compare(DOCTORS[_doctor][i].date, _date) == true
            ) {
                target = i;
                break;
            }
        }
        if (target < DOCTORS[_doctor].length) {
            iterative_delete(target, _doctor);
        }
    }

    // cambiar el estado y la hora en la lista de pacientes cuando el médico confirma o rechaza/cancela una cita
    function change_patient_status(
        address _patient,
        address _doctor,
        string memory _prev,
        string memory _next,
        string memory _date,
        string memory _time
    ) private {
        for (uint i = 0; i < PATIENTS[_patient].length; i++) {
            if (
                PATIENTS[_patient][i].doctor == _doctor &&
                compare(PATIENTS[_patient][i].date, _date) == true &&
                compare(PATIENTS[_patient][i].status, _prev) == true
            ) {
                if (compare(_time, "") == false) {
                    PATIENTS[_patient][i].time = _time;
                }
                PATIENTS[_patient][i].status = _next;
            }
        }
    }

    // médico confirma una cita especificando una hora
    function confirm_appointment(uint _index, string memory _time) public {
        // _index está en peticiones pendientes. Buscar el índice actual
        uint pos = find_doctor_actual_index(_index, "Pendiente");

        // cambiar el estado y la hora en la lista de médicos
        DOCTORS[msg.sender][pos].time = _time;
        DOCTORS[msg.sender][pos].status = "Confirmado";

        address _patient = DOCTORS[msg.sender][pos].patient;
        string memory _date = DOCTORS[msg.sender][pos].date;

        // cambiar el estado y la hora en la lista de pacientes
        change_patient_status(
            _patient,
            msg.sender,
            "Pendiente",
            "Confirmado",
            _date,
            _time
        );
    }

    // médico para ver las solicitudes de cita pendientes
    function get_pending_requests() public view returns (appointment[] memory) {
        appointment[] memory requests = new appointment[](
            get_count(1, "Pendiente", msg.sender)
        );
        uint k = 0;
        for (uint i = 0; i < DOCTORS[msg.sender].length; i++) {
            if (compare(DOCTORS[msg.sender][i].status, "Pendiente")) {
                requests[k] = DOCTORS[msg.sender][i];
                k++;
            }
        }
        return requests;
    }

    // médico para ver las citas confirmadas
    function get_confirmed_appointments()
        public
        view
        returns (appointment[] memory)
    {
        appointment[] memory confirmed = new appointment[](
            get_count(1, "Confirmado", msg.sender)
        );
        uint k = 0;
        for (uint i = 0; i < DOCTORS[msg.sender].length; i++) {
            if (compare(DOCTORS[msg.sender][i].status, "Confirmado")) {
                confirmed[k] = DOCTORS[msg.sender][i];
                k++;
            }
        }
        return confirmed;
    }

    // médico para rechazar una solicitud de cita pendiente
    function reject_pending_request(uint _index) public {
        // _index está en peticiones pendientes. Buscar el índice actual
        uint pos = find_doctor_actual_index(_index, "Pendiente");

        address _patient = DOCTORS[msg.sender][pos].patient;
        string memory _date = DOCTORS[msg.sender][pos].date;

        // cambiar el estado en la lista de pacientes
        change_patient_status(
            _patient,
            msg.sender,
            "Pendiente",
            "Rechazado",
            _date,
            ""
        );

        // quitar cita de la lista de médicos
        iterative_delete(pos, msg.sender);
    }

    // médico para anular una cita confirmada
    function cancel_confirmed_appointment(uint _index) public {
        // _index está en peticiones confirmadas. Se buscae el índice real
        uint pos = find_doctor_actual_index(_index, "Confirmado");

        address _patient = DOCTORS[msg.sender][pos].patient;
        string memory _date = DOCTORS[msg.sender][pos].date;

        // cambiar el estado en la lista de pacientes
        change_patient_status(
            _patient,
            msg.sender,
            "Confirmado",
            "Cancelado",
            _date,
            ""
        );

        // elimina la cita de la lista de médicos
        iterative_delete(pos, msg.sender);
    }

    // médico marca una cita confirmada como completada
    function mark_as_complete(uint _index) public {
        // _index está en peticiones confirmadas. Se busca índice real
        uint pos = find_doctor_actual_index(_index, "Confirmado");

        // cambiar el estado y la hora en la lista de médicos
        DOCTORS[msg.sender][pos].status = "Completado";

        address _patient = DOCTORS[msg.sender][pos].patient;
        string memory _date = DOCTORS[msg.sender][pos].date;

        // cambiar el estado en la lista de pacientes
        change_patient_status(
            _patient,
            msg.sender,
            "Confirmado",
            "Completado",
            _date,
            ""
        );
    }

    /* FUNCIONES DEL PACIENTE */

    // el paciente puede solicitar una cita indicando la fecha y la dirección del médico
    function request_appointment(
        string memory _patient,
        string memory _doctor,
        string memory _date,
        address docAddr
    ) public {
        // insertar cita en el mapa del médico
        DOCTORS[docAddr].push(
            appointment(
                _date,
                "",
                msg.sender,
                _patient,
                docAddr,
                _doctor,
                "Pendiente"
            )
        );

        // insertar cita en el mapa del paciente
        PATIENTS[msg.sender].push(
            appointment(
                _date,
                "",
                msg.sender,
                _patient,
                docAddr,
                _doctor,
                "Pendiente"
            )
        );
    }

    // paciente observa las solicitudes de cita
    function patient_get_all_appointments()
        public
        view
        returns (appointment[] memory)
    {
        return PATIENTS[msg.sender];
    }

    // paciente observa las solicitudes pendientes
    function patient_get_pending_requests()
        public
        view
        returns (appointment[] memory)
    {
        appointment[] memory requests = new appointment[](
            get_count(0, "Pendiente", msg.sender)
        );
        uint k = 0;
        for (uint i = 0; i < PATIENTS[msg.sender].length; i++) {
            if (compare(PATIENTS[msg.sender][i].status, "Pendiente")) {
                requests[k] = PATIENTS[msg.sender][i];
                k++;
            }
        }
        return requests;
    }

    // paciente observa citas confirmadas
    function patient_get_confirmed_appointments()
        public
        view
        returns (appointment[] memory)
    {
        appointment[] memory confirmed = new appointment[](
            get_count(0, "Confirmado", msg.sender)
        );
        uint k = 0;
        for (uint i = 0; i < PATIENTS[msg.sender].length; i++) {
            if (compare(PATIENTS[msg.sender][i].status, "Confirmado")) {
                confirmed[k] = PATIENTS[msg.sender][i];
                k++;
            }
        }
        return confirmed;
    }

    // paciente elimina una solicitud de cita pendiente
    function patient_delete_pending_request(uint _index) public {
        uint pos = find_patient_actual_index(_index, "Pendiente");

        // cambiar el estado en la lista de pacientes
        PATIENTS[msg.sender][pos].status = "Eliminado";

        address _doctor = PATIENTS[msg.sender][pos].doctor;
        string memory _date = PATIENTS[msg.sender][pos].date;

        // eliminar cita de la lista de médicos
        delete_appointment(_doctor, msg.sender, _date);
    }

    // paciente para cancelar una cita confirmada
    function patient_cancel_confirmed_appointment(uint _index) public {
        uint pos = find_patient_actual_index(_index, "Confirmado");

        // cambiar el estado en la lista de pacientes
        PATIENTS[msg.sender][pos].status = "Cancelado";

        address _doctor = PATIENTS[msg.sender][pos].doctor;
        string memory _date = PATIENTS[msg.sender][pos].date;

        // quitar cita de la lista de médicos
        delete_appointment(_doctor, msg.sender, _date);
    }
}