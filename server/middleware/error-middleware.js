const errorMiddlware = (err, req, res, next) => {
    const status = err.status || 500
    const message = err.message || "Error occured, please try again later"
    const extraDetails = err.extraDetails || "error occured, please try again later"

    return res.status(status).json({ message, extraDetails })
}


export default errorMiddlware