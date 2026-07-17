import { I as sequence, V as defineMiddleware } from "./chunks/fetch-state_Q5u-_skv.mjs";
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(defineMiddleware(async (context, next) => {
	const { url } = context;
	url.pathname;
	return next();
}));
//#endregion
export { onRequest };
