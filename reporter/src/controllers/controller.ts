import 'dotenv/config';
import { RequestHandler, Router } from 'express';

import { errorResponse } from '../api/baseResponses';

import { CustomError, IError } from '../errors/customErrors';

export abstract class Controller {
	public readonly path: string;
	public readonly router: Router;

	constructor(path: string) {
		this.path = path;
		this.router = Router();
	}

	/**
	 * This method allows to catch all errors in the router
	 * And depending on error type respond with needed response
	 * @param route
	 * @return RequestHandler
	 */
	public wrapper = ({ route }: { route: any }): RequestHandler => {
		return async (req, res, next) => {
			try {
				await route(req, res, next);
			} catch (error: any) {
				if (error instanceof IError) {
					res.status(400).json(errorResponse(400, error.message));
					return;
				}
				if (error instanceof CustomError) {
					res.status(error.status).json(error.message);
					return;
				}
				res.status(500).json(errorResponse(500, 'Internal server error'));
				return;
			}
		};
	};
}
