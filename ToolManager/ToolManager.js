///////////////////////////////////
//        SUN ToolManager
///////////////////////////////////
// import { HTML } from '../Utils.js';

// class MicroTool
export class MicroTool {
	constructor(name, nickname = '', description = '', reset = () => { return {} }) {
		this.name = name
		this.uid = 0
		this.autorun = () => { return null }
		this.reset = reset
		this.data = this.reset()
		this.nickname = nickname === '' ? this.name : nickname
		this.description = description
	}

	reset_Data() {
		this.data = this.reset()
	}
}

// class FlowGraph
export class FlowGraph {
	constructor(pathstr, startname, transforms = {}, signals = {}) {
		let path = pathstr.split('|')

		this.nodes = new Array()
		this.transforms = transforms
		this.signals = signals

		for (let i = 0; i < path.length; i++) {
			let pathitem = path[i].split('-')
			if (pathitem.length === 1) {
				let nodeFromIndex = this.create_Node(pathitem[0])
			}
			else if (pathitem.length === 2) {
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
		if (start_index === null) {
			throw new Error('Can not find startnode with name of \'' + startname + '\'')
		}
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
		let n = name.split(':')[0]
		let node = this.get_NodeIndex(n)
		if (node !== null) return node
		this.nodes.push(new FlowGraphNode(name))
		return this.nodes.length - 1
	}

	advance(flag) {
		let path = this.current_node.get_Path(flag)
		// //console.log(path)
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
		let names = name.split(':')
		this.raw_name = name
		this.name = names[0]
		this.toolname = this.name.split('#')[0]
		this.params = names[1] !== undefined ? names[1].split(',') : []
		// the map of the flag and the next node
		this.path = new Array()
	}

	add_Path(flag, to, transform = "") {
		this.path.push({ flag: flag, next: to, transform: transform })
	}

	get_Path(flag) {
		for (let i = 0; i < this.path.length; i++) {
			let pathitem = this.path[i]
			if (pathitem.flag === 'ALL' || pathitem.flag === flag) {
				return pathitem
			}
		}
		return null
	}

	no_Next() {
		if (this.path.length <= 0) return true
		return false
	}
}

// class ToolManager
export class ToolManager {
	constructor(log = (type, info) => { }, fin = () => { }) {
		this.micro_tools = {}
		this.current_tool = null
		this.global_data = {}
		this.last_param = {}
		this.graph = null
		this.log_func = log
		this.fin_func = fin
		this.graph_stack = []
		this.global_data_stack = []
		this.allow_input = true
	}

	add_MicroTool(microtool) {
		if (!(microtool instanceof MicroTool)) {
			throw new Error("microtoll is not an instance of MicroTool Class")
		}

		if (this.micro_tools[microtool.name] !== undefined)
			throw new Error("microtool name already existed")

		this.micro_tools[microtool.name] = microtool
		// microtool.uid = this.micro_tools.length
	}

	equip_Tools(obj) {
		for (let key in obj) {
			this.add_MicroTool(obj[key])
		}
	}

	get_MicroTool(toolname) {
		if (this.micro_tools[toolname] === undefined) return null
		else return this.micro_tools[toolname]
	}

	new_MicroTool(toolname) {
		let tool = this.get_MicroTool(toolname)
		this.current_tool = tool
		// tool.reset_Data()
	}

	get_ToolStyledHTML() {
		if (this.current_tool !== null) {
			let str = "<span style=\"padding: 4px 8px ; background-color:rgb(240, 70, 60); border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:white;font-weight:bold;\">微工具</span><span style=\"padding: 4px 8px ; background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;\">" + this.current_tool.nickname + "</span>"
			return str
		}
		return ''
	}

	// 
	log(type, msg) {
		// this.log_func(type, 'ToolManager', HTML.create_TabOr([this.get_ToolStyledHTML(), msg]))
	}

	emit(signal, param = {}) {
		signal = this.graph.current_node.name + "_" + signal
		// console.log(signal)
		if (this.graph.signals[signal] !== undefined) {
			return this.graph.signals[signal](this.global_data, param, this.graph.current_node.params)
		}
	}

	call(func, param = {}) {
		if (this.allow_input && this.current_tool !== null && this.current_tool[func] !== undefined) {
			this.step(func, param)
		}
	}

	// running
	start_SubGraph(graph, param, global) {
		this.global_data_stack.push(this.global_data)
		this.graph_stack.push(this.graph)
		this.global_data = global
		this.graph = graph
		this.last_param = param
	}

	end_SubGrpah() {
		if (this.graph_stack.length === 0 || this.graph_stack[this.graph_stack.length - 1] === null) {
			this.end()
			return false;
		}
		// console.error("end Subgraph", result)
		this.global_data = this.global_data_stack.pop()
		this.graph = this.graph_stack.pop()
		return true;
	}

	step(func = 'autorun', callevent = undefined) {
		let result = null
		while (this.graph.current_node !== null) {
			let { toolname, name, params } = this.graph.current_node
			if (toolname === 'SubGraph') {
				this.start_SubGraph(this.last_param.subgraph, this.last_param.param || {}, this.last_param.global || {})
			}
			else {
				this.new_MicroTool(toolname)
				if (func === 'autorun') this.current_tool.reset_Data()
				if (this.current_tool[func] !== undefined) {
					result = this.current_tool[func](this, this.global_data, this.last_param, callevent, params)
					func = 'autorun'
					if (result !== null) {
						let transform = this.graph.advance(result.flag)
						if (this.graph.current_node === null) {
							if (!this.end_SubGrpah()) {
								return
							}
							transform = this.graph.advance(result.flag)
						}
						let transformfunc = this.graph.transforms[transform]
						if (transform !== "" && transformfunc !== undefined) {
							result.param = transformfunc(this.global_data, result.param, params)
						}
						this.last_param = result.param

					}
					else {
						return
					}
				}
				else
					throw new Error(`function name ${func} not found in microtool ${this.current_tool.name}`)
			}
		}
		this.end_SubGrpah()
	}

	run(graph, param = {}, global = {}) {
		if (this.is_Running()) return new Error('ToolManager is still running')
		this.start_SubGraph(graph, param, global)
		this.step()
	}

	end() {
		this.current_tool = null
		this.global_data = {}
		this.graph = null
		this.last_param = {}
		this.graph_stack = []
		this.global_data_stack = []
		this.fin_func()
	}

	is_Running() {
		return (this.graph !== null)
	}
}
