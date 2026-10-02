const express = require("express");
const router = express.Router();

const Consultation = require("../models/consultation");
const Patient = require("../models/patient");

// Gestion des erreurs
function handleError(res, err) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      message: "Erreur de validation",
      errors: messages
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Identifiant invalide"
    });
  }

  console.error("❌ Erreur inattendue :", err);

  return res.status(500).json({
    message: "Erreur interne du serveur"
  });
}


// =========================
// CREATE - POST
// =========================
router.post("/", async (req, res) => {
  try {

    // Vérifier que le patient existe
    const patientExiste = await Patient.exists({
      _id: req.body.patient
    });

    if (!patientExiste) {
      return res.status(404).json({
        message: "Patient introuvable"
      });
    }

    // Créer la consultation
    const consultation = new Consultation(req.body);

    await consultation.save();

    res.status(201).json(consultation);

  } catch (err) {
    handleError(res, err);
  }
});


// =========================
// GET ALL
// =========================
router.get("/", async (req, res) => {
  try {

    // Objet contenant les filtres
    const filtre = {};

    // Filtre par patient
    if (req.query.patient) {
      filtre.patient = req.query.patient;
    }

    // Filtre par statut
    if (req.query.statut) {
      filtre.statut = req.query.statut;
    }

    const consultations = await Consultation.find(filtre)
      .populate("patient", "nom prenom")
      .sort({ date: -1 });

    res.json(consultations);

  } catch (err) {
    handleError(res, err);
  }
});


// =========================
// GET ONE
// =========================
router.get("/:id", async (req, res) => {
  try {

    const consultation = await Consultation.findById(req.params.id)
      .populate("patient", "nom prenom");

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation non trouvée"
      });
    }

    res.json(consultation);

  } catch (err) {
    handleError(res, err);
  }
});


// =========================
// UPDATE - PUT
// =========================
router.put("/:id", async (req, res) => {
  try {

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate("patient", "nom prenom");

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation non trouvée"
      });
    }

    res.json(consultation);

  } catch (err) {
    handleError(res, err);
  }
});


// =========================
// DELETE
// =========================
router.delete("/:id", async (req, res) => {
  try {

    const consultation = await Consultation.findByIdAndDelete(
      req.params.id
    );

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation non trouvée"
      });
    }

    res.json({
      message: "Consultation supprimée avec succès"
    });

  } catch (err) {
    handleError(res, err);
  }
});


module.exports = router;