class EventEmitter {
	constructor(event_name) {
		this.events = {};
		this.name = event_name;
	}

	trigger(...argues) {
		Reflect.ownKeys(this.events).forEach(key => {
			this.events[key](...argues);
		});
	}

	bind(callback, opt = { once: false }) {
		let sym = Symbol();
		this.events[sym] = callback;
		if (opt.once !== undefined && opt.once) {
			this.events[sym] = (...data) => {
				callback(...data);
				this.unbind(sym);
			}
		}
		return sym;
	}

	once(callback) {
		return this.bind(callback, { once: true })
	}

	off() {
		this.events = {}
	}

	unbind(sym) {
		if (sym in this.events)
			delete this.events[sym]
	}
}

export default EventEmitter;