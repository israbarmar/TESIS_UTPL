const Health = artifacts.require("Health");
const Appointment = artifacts.require("Appointment");

module.exports = async function(deployer) {
  // Deploy Health contract
  await deployer.deploy(Health);
  const healthInstance = await Health.deployed();

  // Añadir un nuevo médico
  await healthInstance.add_doctor(
    '0xB809AD7A57FbBC627Cb24713A2c94F7f1c26aFD5',
    'Bivianne Soledad Marquez',
    'Clinica Privada',
    'Médico General',
    59,
    'Doctora'
  );

  // Deploy Appointment contract
  await deployer.deploy(Appointment);
};
