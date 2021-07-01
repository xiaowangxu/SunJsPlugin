let uid = BigInt(0);
function get_UniqueID() {
	return uid++;
}

export class Action {
	constructor() {
		this.uid = get_UniqueID();
		this.type = "Base Action";
		this.name = 'Action';
	}

	execute(editor) {

	}

	undo(editor) {

	}

	redo(editor) {

	}

	dispose(editor) {

	}
}