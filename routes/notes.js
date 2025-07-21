import express from "express";
import  Note  from "../models/Notes.js";
import { authMiddleware } from "../utils/auth.js";

const router = express.Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

//========== Routes as per the Requiremnt =========
// GET /api/notes - Get all notes for the logged-in user
// THIS IS THE ROUTE THAT CURRENTLY HAS THE FLAW
router.get("/", async (req, res) => {
  // This currently finds all notes in the database.
  // It should only find notes owned by the logged in user.
  try {
    // const user= req.user._id
    // console.log(user)
    const notes = await Note.find({user: req.user._id});
    // console.log(user)
    res.json(notes);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST /api/notes - Create a new note
router.post("/", async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
       // The user ID needs to be added here: this comment is from cloned code
       //Added the below line to satisfy the above comment
      user: req.user._id
     
    });
    res.status(201).json(note);
    console.log(user)
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT /api/notes/:id - Update a note
router.put("/:id", async (req, res) => {  

  try {
    // This needs an authorization check
    const note = await Note.findById(req.params.id)
    console.log(note.user)
    console.log(req.user._id)  

    if(note.user != req.user._id){
       return res.status(404).json({ message: "Not authorised to update the note!" });
    }  

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedNote) {
      return res.status(404).json({ message: "No note found with this id!" });
    }  
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete("/:id", async (req, res) => {
  try {
    // This needs an authorization check
   const note = await Note.findById(req.params.id)
     if(note.user != req.user._id){
       return res.status(404).json({ message: "Not authorised to delete the note!" });
    }
      const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ message: "No note found with this id!" });
    }
    res.json({ message: "Note deleted!" });
  } catch (err) {
    res.status(500).json(err);
  }
});
//====== Required routes ends=========

//======Extra Routes=======

router.get('/allnotes', async (req,res) => {
  try {
    const allNotes = await Note.find()
    res.status(201).json(allNotes)
  } catch (error) {
    console.log(error)
    res.status(400).json({error: error.message})
  }
})

router.get('/:id', async (req,res) => {
  try {
    const note = await Note.findById(req.params.id)
    console.log(note)
    console.log(note.user)
    console.log(req.user._id)
    if(note.user != req.user._id){
       return res.status(404).json({ message: "Not authorised access this note!" });
    }  
    if(!note){
       return res.status(404).json({ message: "No note found with this id!" });
    }
    res.json(note);
    
  } catch (error) {
     console.log(error)
    res.status(400).json({error: error.message})
  }
  
})

export default router;
