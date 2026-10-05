const express = require("express");
const router = express.Router();

const Patient = require("../models/patient");

// Fonction pour gérer les erreurs Mongoose
function handleError(res, err) {
  // Erreur de validation du schéma
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      message: "Erreur de validation",
      errors: messages
    });
  }

  // Erreur de format d'identifiant MongoDB
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Identifiant invalide"
    });
  }

  // Toute autre erreur
  console.error("❌ Erreur inattendue :", err);

  return res.status(500).json({
    message: "Erreur interne du serveur"
  });
}
// CREATE -> 201
router.post("/", async (req, res) => {
  try {
    const patient = new Patient(req.body);

    await patient.save();

    res.status(201).json(patient);
  } catch (err) {
    handleError(res, err);
  }
});

// READ ALL -> 200 (filtre optionnel : ?statut=Actif) 
router.get("/", async (req, res) => { 
  try { 
    const filtre = {}; 
    if (req.query.statut) filtre.statut = req.query.statut; 
    const patients = await Patient.find(filtre).sort({ nom: 1 }); 
    res.json(patients); 
  } catch (err) { handleError(res, err); } 
}); 

// READ ONE -> 200 ou 404 
router.get("/:id", async (req, res) => { 
  try { 
    const patient = await Patient.findById(req.params.id); 
    if (!patient) return res.status(404).json({ message: "Patient introuvable" }); 
    res.json(patient); 
  } catch (err) { handleError(res, err); } 
});

// DELETE -> 204 (sans corps) ou 404 
router.delete("/:id", async (req, res) => { 
  try { 
    const patient = await Patient.findByIdAndDelete(req.params.id); 
    if (!patient) return res.status(404).json({ message: "Patient introuvable" }); 
    res.status(204).send(); 
  } catch (err) { handleError(res, err); } 
}); 

router.put("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body,
      { returnDocument: "after", runValidators: true });
    if (!patient) return res.status(404).json({ message: "Patient introuvable" });
    res.json(patient);
  } catch (err) { handleError(res, err); }
});




// Toujours terminer le fichier par cette ligne
module.exports = router;