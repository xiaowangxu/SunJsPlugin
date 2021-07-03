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

	bind(callback) {
		let sym = Symbol();
		this.events[sym] = callback;
		return sym;
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