import { db } from "../database/database.connection.js";
import { customerSchema } from "../schemas/customer.schemas.js";
import moment from "moment";

export async function validateCustomer(req, res, next) {
    const customer = req.body;
    const { cpf } = req.body;

    const { error } = customerSchema.validate(customer, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    try {
        const existingCustomer = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [cpf]);
        if (existingCustomer.rows.length > 0) {
            return res.status(409).send("Cliente já cadastrado");
        }

    } catch (err) {
        res.status(500).send(err.message);
        return;
    }
    res.locals.customer = customer;
    next();
};
export async function updateValidation(req, res, next) {
    const { id } = req.params;
    const { cpf } = req.body;
    const customer = req.body;
    const { error } = customerSchema.validate(customer, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    try {
        const existingCustomer = await db.query(`SELECT * FROM customers WHERE id=$1`, [id]);
        if (existingCustomer.rows.length === 0) {
            return res.sendStatus(404);
        }

        const checkCPF = await db.query(`SELECT * FROM customers WHERE id!=$1 AND cpf=$2`, [id, cpf]);
        if (checkCPF.rows.length > 0) {
            return res.sendStatus(409);
        }

    } catch (err) {
        res.status(500).send(err.message);
        return;
    }

    res.locals.customer = customer;
    next()
}