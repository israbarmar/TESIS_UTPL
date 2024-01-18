const Health = artifacts.require("Health");
const Appointment = artifacts.require("Appointment");

module.exports = async function(deployer) {
  // Deploy Health contract
  await deployer.deploy(Health);
  const healthInstance = await Health.deployed();

  // Añadir un nuevo médico
  await healthInstance.add_doctor(
    '0x833Af4fFCaFBb35Cd15eAea6B3eF8c60Fef86D97',
    'Bivianne Soledad Marquez',
    'Clinica Privada',
    'Médico General',
    59,
    'Doctora'
  );

  // Deploy Appointment contract
  await deployer.deploy(Appointment);
};
