export class ToolManager {
	constructor(log) {
		this.micro_tools = new Array()
		this.current_tool = null
		this.global_data = {}
		this.last_param = {}
		this.graph = null
		this.log_func = log
	}

	add_MicroTool(microtool) {
		if (!(microtool instanceof MicroTool)) {
			throw new Error("microtoll is not an instance of MicroTool Class")
		}

		for (let i = 0; i < this.micro_tools.length; i++) {
			if (microtool.name === this.micro_tools[i].name) {
				throw new Error("microtool name already existed")
			}
		}

		this.micro_tools.push(microtool)
		microtool.uid = this.micro_tools.length
	}

	get_MicroTool(toolname) {
		for (let i = 0; i < this.micro_tools.length; i++) {
			if (toolname === this.micro_tools[i].name) {
				return this.micro_tools[i]
			}
		}
		return null
	}

	turnTo(toolname, param) {
		this.last_param = param
		let tool = this.get_MicroTool(toolname)
		if (tool === null) {
			throw new Error("MicroTool not found")
		}
		this.current_tool = tool
		this.log_func('log', this.current_tool.nickname + " " + this.current_tool.description)
		if (this.current_tool.autorun !== undefined) {
			this.current_tool.reset_Data()
			return this.current_tool.autorun(this, this.global_data, this.last_param)
		}
		return null
	}

	send_Param(param) {
		this.last_param = param
	}

	emit(signal, param = {}) {
		signal = this.current_tool.name + "_" + signal
		if (this.graph.signals[signal] !== undefined) {
			this.graph.signals[signal](this.global_data, param)
		}
	}

	call(func, param = {}) {
		if (this.current_tool !== null && this.current_tool[func] !== undefined) {
			let result = (this.current_tool[func])(this, this.global_data, param, this.last_param)
			if (result !== null) {
				if (result.flag === "ERROR") {
					this.current_tool = null
					this.global_data = {}
					this.signals = {}
					this.graph = null
					this.log_func('error', result.param.errorMsg)
					return
				}
				else if (result.flag === "END") {
					this.current_tool = null
					this.global_data = {}
					this.signals = {}
					this.graph = null
					// comment
					// console.log("Graph Ended")
					return
				}
				let transform = this.graph.advance(result.flag)
				if (transform !== null && this.graph.transforms[transform] !== undefined) {
					// comment
					// console.log("-> Transform: " + transform)
					result.param = this.graph.transforms[transform](this.global_data, result.param)
				}
				this.run(this.graph, result.param, this.global_data)
				return
			}
		}
	}

	run(graph, param, global = {}) {
		if (this.graph !== null && this.graph !== graph) {
			throw new Error("Has FlowGraph in progress")
		}
		this.graph = graph
		this.global_data = global
		if (this.graph.current_node === null) {
			throw new Error("State is null")
		}
		let result = this.turnTo(this.graph.current_node.name, param)
		while (result !== null) {
			if (result.flag === "ERROR") {
				this.current_tool = null
				this.global_data = {}
				this.signals = {}
				this.graph = null
				this.log_func('error', result.param.errorMsg)
				return
			}
			else if (result.flag === "END") {
				this.current_tool = null
				this.global_data = {}
				this.signals = {}
				this.graph = null
				// comment
				// console.log("Graph Ended 1")
				return
			}
			let transform = this.graph.advance(result.flag)
			if (this.graph.current_node === null) {
				this.current_tool = null
				this.global_data = {}
				this.signals = {}
				this.graph = null
				// comment
				// console.log("Graph Ended 1")
				return
			}
			if (transform !== null && this.graph.transforms[transform] !== undefined) {
				// comment
				// console.log("-> Transform: " + transform)
				result.param = this.graph.transforms[transform](this.global_data, result.param)
			}
			result = this.turnTo(this.graph.current_node.name, result.param)
		}
		// if (this.graph.current_node.no_Next()) {
		// 	this.current_tool = null
		// 	this.global_data = {}
		// 	this.transforms = {}
		// 	this.graph = null
		// 	this.signals = {}
		// 	// comment
		// 	// console.log("Graph Ended 2")
		// 	return
		// }
		// comment
		// console.log("Autorun Finished, Current State = " + this.current_tool.name)
	}
}

export class MicroTool {
	constructor(name, nickname = '', description = '', reset = () => { return {} }) {
		this.name = name
		this.uid = 0
		this.autorun = () => { return null }
		this.reset = reset
		this.data = this.reset()
		this.nickname = nickname === '' ? this.name : nickname
		this.description = description === '' ? this.name : description
	}

	reset_Data() {
		this.data = this.reset()
	}
}

export class FlowGraph {
	constructor(pathstr, startname, transforms = {}, signals = {}) {
		let path = pathstr.split('|')

		this.nodes = new Array()
		this.transforms = transforms
		this.signals = signals

		for (let i = 0; i < path.length; i++) {
			let pathitem = path[i].split('-')
			if (pathitem.length === 2) {
				let nodeFromIndex = this.create_Node(pathitem[0])
				let nodeToIndex = this.create_Node(pathitem[1])
				this.nodes[nodeFromIndex].add_Path('ALL', nodeToIndex)
			}
			else if (pathitem.length === 3) {
				let nodeFromIndex = this.create_Node(pathitem[0])
				let nodeToIndex = this.create_Node(pathitem[2])
				this.nodes[nodeFromIndex].add_Path(pathitem[1], nodeToIndex)
			}
			else if (pathitem.length === 4) {
				let nodeFromIndex = this.create_Node(pathitem[0])
				let nodeToIndex = this.create_Node(pathitem[3])
				this.nodes[nodeFromIndex].add_Path(pathitem[1], nodeToIndex, pathitem[2])
			}
		}

		let start_index = this.get_NodeIndex(startname)
		this.current_node = this.nodes[start_index]
	}

	get_NodeByName(name) {
		for (let i = 0; i < this.nodes.length; i++) {
			if (name === this.nodes[i].name) {
				return this.nodes[i]
			}
		}
		return null
	}

	get_NodeIndex(name) {
		for (let i = 0; i < this.nodes.length; i++) {
			if (name === this.nodes[i].name) {
				return i
			}
		}
		return null
	}

	create_Node(name) {
		let node = this.get_NodeIndex(name)
		if (node !== null) return node
		this.nodes.push(new FlowGraphNode(name))
		return this.nodes.length - 1
	}

	advance(flag) {
		// console.log("-> " + flag)
		let path = this.current_node.get_Path(flag)
		if (path !== null) {
			this.current_node = this.nodes[path.next]
			return path.transform
		}
		else {
			this.current_node = null
			return null
		}
	}
}

class FlowGraphNode {
	constructor(name) {
		this.name = name
		this.path = new Array()
	}

	add_Path(flag, to, transform = "") {
		this.path.push({ flag: flag, next: to, transform: transform })
	}

	get_Path(flag) {
		for (let i = 0; i < this.path.length; i++) {
			let pathitem = this.path[i]
			if (pathitem.flag === flag) {
				return pathitem
			}
		}
		return null
	}

	no_Next() {
		if (this.path.length <= 0) return true
		return false
	}

	get_Next(flag) {
		for (let i = 0; i < this.path.length; i++) {
			let pathitem = this.path[i]
			if (pathitem.flag === 'all') {
				return pathitem.next
			}
			if (pathitem.flag === flag) {
				return pathitem.next
			}
		}
		return -1
	}
}