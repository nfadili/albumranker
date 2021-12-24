

export default {
	info: (msg: string, props = {}) => {
		const log = JSON.stringify({ msg, ...props });
		console.log(log);
	},
	error: (msg: string, props = {}) => {
		const log = JSON.stringify({ msg, ...props });
		console.error(log);
	}
};