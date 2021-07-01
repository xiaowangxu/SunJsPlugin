export class History {
	constructor(editor, log_func = (type, title, info) => { console.log(type, title, info); }) {
		this.editor = editor;
		this.undos = [];
		this.redos = [];
		this.last_action_time = new Date();
		this.index = 0;
		this.log_func = log_func;
		this.enable = true;
	}

	set_Enable(t) {
		this.enable = t;
	}

	execute(action, override_name = undefined) {
		// add to undo list
		this.undos.push(action);
		action.id = ++this.index;
		if (override_name !== undefined)
			action.name = override_name

		// execute the action
		action.execute(this.editor);
		this.last_action_time = new Date();

		// empty redo list
		let redos = this.redos;
		this.redos = [];
		redos.forEach((action) => {
			action.dispose(this.editor);
		});
		this.log_func('log', 'Executed!', '');
	}

	undo() {
		if (!this.enable) {
			this.log_func('warn', '', '');
			return;
		}

		let action = undefined;
		if (this.undos.length > 0) {
			action = this.undos.pop();
		}

		if (action !== undefined) {
			action.undo(this.editor);
			this.redos.push(action);
		}
		this.log_func('log', 'Undoed!', '');
		return action;
	}

	redo() {
		if (!this.enable) {
			this.log_func('warn', '', '');
			return;
		}

		let action = undefined;
		if (this.redos.length > 0) {
			action = this.redos.pop();
		}

		if (action !== undefined) {
			action.redo(this.editor);
			this.undos.push(action);
		}

		this.log_func('log', 'Redoed!', '');
		return action;
	}

	clear() {
		let actions = this.undos.concat(this.redos);
		actions.forEach((action) => {
			action.dispose(this.editor);
		});
		this.undos = [];
		this.redos = [];
		this.index = 0;
	}
}