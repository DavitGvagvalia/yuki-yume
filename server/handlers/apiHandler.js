
 const errorhandler = (err,res) => {
    console.error(err.stack);
    return {
      status: 500,
      json: { message: 'Internal Server Error', error: err.message }
    }
  };
  
const requiredfieldsHandler = (product,requiredFields) => {
      const missingFields = requiredFields.filter(field => !product[field]);
      if (missingFields.length > 0) {
        return {
          status: 400,
          json: { message: `Missing required fields: ${missingFields.join(', ')}` }
        };
      }
    };
 
 const callHandler = (handler, requiredFields) => {
    return async (req, res) => {
      try {
        const missingFields = requiredfieldsHandler(req.body, requiredFields)

        if (missingFields) {
          return res.status(missingFields.status).json(missingFields.json);
        }
        await handler(req, res);
      } catch (err) {
        return res.status(errorhandler(err,res).status).json(errorhandler(err,res).json);
      }
    };
  }


export { callHandler, errorhandler, requiredfieldsHandler };