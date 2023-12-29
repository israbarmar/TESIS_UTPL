const Health = artifacts.require("Health");
const Appointment = artifacts.require("Appointment");

module.exports = async function(deployer) {
  // Deploy Health contract
  await deployer.deploy(Health);
  const healthInstance = await Health.deployed();

  // Añadir un nuevo médico
  await healthInstance.add_doctor(
    '0xE4e7337e8b1f3d8263352Ce18B448DD90Dada7B2',
    'Bivianne Soledad Marquez',
    'Clinica Privada',
    'Médico General',
    59,
    'Doctora'
  );

  // Deploy Appointment contract
  await deployer.deploy(Appointment);
};
