export const success = (res, data, message = 'Success', status = 200) => {
    res.status(status).json({
        success: true,
        message, 
        data
    });
};

export const error = (res, message='Something went wrong', status=400, errors = null) =>{
    res.status(status).json({
        success: false,
        message, 
        errors
    });
};

