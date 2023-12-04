const Health = artifacts.require("Health");
const Appointment = artifacts.require("Appointment");

module.exports = async function(deployer) {
  // Deploy Health contract
  await deployer.deploy(Health);
  const healthInstance = await Health.deployed();

  // Añadir un nuevo médico
  await healthInstance.add_doctor(
    '0x54bb3877C487261c66cc894662De68746a016c05',
    'Bivianne Soledad Marquez',
    'Clinica Privada',
    'Médico General',
    59,
    'Doctora'
  );

  // Deploy Appointment contract
  await deployer.deploy(Appointment);
};
