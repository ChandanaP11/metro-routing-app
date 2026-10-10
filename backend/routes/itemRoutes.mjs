import express from 'express'
import itemModel from '../model/item.mjs';

const router = express.Router();

router.get('/', async(req, res)=> {
    try
      {
       const items = await itemModel.find()
      if(items.length === 0)
         res.status(404).json({message:'Items not Found'})
   
       res.json({data:items})
     }catch(error){
        res.status(500).json({message:'server error'})
   }
   })






   
   router.post('/', async(req, res)=> {
       const {name, category, price} = req.body
       try
         {
           const item = new itemModel({
               name, category, price
           })
           await item.save()
         if(!item)
            res.status(404).json({message:'unable to add item'})
           res.status(201).json({message:'New Record added',data:item})
        }catch(error){
           res.status(500).json({message:'server error'})
      }
      })



   
    router.get('/:id', async(req, res)=> {
       try
         {
          const item = await itemModel.findById(req.params.id)
          if(!item)
           res.status(404).json({message:'unable to find item'})
          res.status(200).json({data:item})
        }catch(error){
           res.status(500).json({message:'server error'})
      }
      })
   



      router.put('/:id', async(req, res)=> {
       try
         {
          const item = await itemModel.findByIdAndUpdate(req.params.id,req.body, {new:true})
          if(!item)
           res.status(404).json({message:'unable to find item'})
          res.status(200).json({message:'Updated successfully...', data:item})
        }catch(error){
           res.status(500).json({message:'server error'})
      }
      })








   
      router.delete('/:id', async(req, res)=> {
       try
         {
          const item = await itemModel.findByIdAndDelete(req.params.id)
          if(!item)
           res.status(404).json({message:'unable to find item'})
          res.status(200).json({message:'Deleted successfully...', data:item})
        }catch(error){
           res.status(500).json({message:'server error'})
      }
      })
   
      export default router