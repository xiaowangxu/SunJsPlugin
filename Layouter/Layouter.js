export class Panel {
	constructor(panel_id = "", name, resize_func = null, expand_x = true, expand_y = true, min_width = 100, min_height = 100, visible = true, switch_created_callback = null) {
		this.parent = null
		this.panel_id = panel_id
		this.name = name
		this.panel_object = null
		this.x = 100
		this.y = 100
		this.width = 100
		this.height = 100
		this.min_width = min_width
		this.min_height = min_height
		this.on_resize = resize_func
		this.switch_created_callback = switch_created_callback
		this.direction = true
		this.children = new Array()
		this.expand_x = expand_x
		this.expand_y = expand_y
		this.visible = visible
		this.control_switch = false
		this.current_panelname = ''
		// console.log(this)
	}

	refresh_Panel(x, y, width, height, visible = true) {
		visible = visible ? (this.visible ? true : false) : false
		if (this.panel_object !== null) {
			this.panel_object.style.left = x + 'px'
			this.panel_object.style.top = y + 'px'
			this.panel_object.style.width = width + 'px'
			this.panel_object.style.height = height + 'px'
			this.panel_object.style.visibility = visible ? 'visible' : 'hidden'
			// console.log(">> refresh panel", this.panel_object, x, y, width, height, visible)
			if (this.on_resize !== null && this.on_resize !== undefined) {
				this.on_resize(x, y, width, height, visible)
			}
		}
		else if (this.is_ControlPanel() && !this.control_switch) {
			let children = this.children.filter((item) => { return item.visible })
			let count = children.length
			if (this.direction) {	// H
				let fix_array = children.filter((item) => { return !item.expand_x })
				let expand_array = children.filter((item) => { return item.expand_x })

				let total_min_width = 0
				let count = children.length
				for (let i = 0; i < count; i++) {
					total_min_width += children[i].min_width
				}
				if (expand_array.length > 0) {
					let total_expand_min_width = 0
					for (let i = 0; i < expand_array.length; i++) {
						total_expand_min_width += expand_array[i].min_width
					}
					if (total_min_width < width) {
						let remain_width = width
						for (let i = 0; i < fix_array.length; i++) {
							fix_array[i].width = fix_array[i].min_width
							remain_width -= fix_array[i].min_width
						}
						for (let i = 0; i < expand_array.length; i++) {
							let child_width = remain_width * expand_array[i].min_width / total_expand_min_width
							expand_array[i].width = child_width
						}

						let child_x = x
						for (let i = 0; i < count; i++) {
							children[i].x = child_x
							children[i].y = y
							children[i].height = height
							children[i].refresh_Panel(children[i].x, children[i].y, children[i].width, children[i].height, visible)
							child_x += children[i].width
						}
					}
					else {
						let child_x = x
						for (let i = 0; i < count; i++) {
							children[i].x = child_x
							children[i].y = y
							children[i].height = height
							children[i].width = children[i].min_width / total_min_width * width
							children[i].refresh_Panel(children[i].x, children[i].y, children[i].width, children[i].height, visible)
							child_x += children[i].width
						}
					}
				}
				else {
					let child_x = x
					for (let i = 0; i < count; i++) {
						children[i].x = child_x
						children[i].y = y
						children[i].height = height
						children[i].width = children[i].min_width / total_min_width * width
						children[i].refresh_Panel(children[i].x, children[i].y, children[i].width, children[i].height, visible)
						child_x += children[i].width
					}
				}
			}
			else {					// V
				let fix_array = children.filter((item) => { return !item.expand_y })
				let expand_array = children.filter((item) => { return item.expand_y })

				let total_min_height = 0
				for (let i = 0; i < count; i++) {
					total_min_height += children[i].min_height
				}

				if (expand_array.length > 0) {
					let total_expand_min_height = 0
					for (let i = 0; i < expand_array.length; i++) {
						total_expand_min_height += expand_array[i].min_height
					}
					if (total_min_height < height) {
						let remain_height = height
						for (let i = 0; i < fix_array.length; i++) {
							fix_array[i].height = fix_array[i].min_height
							remain_height -= fix_array[i].min_height
						}

						for (let i = 0; i < expand_array.length; i++) {
							let child_height = remain_height * expand_array[i].min_height / total_expand_min_height
							expand_array[i].height = child_height
						}

						let child_y = y
						for (let i = 0; i < count; i++) {
							children[i].x = x
							children[i].y = child_y
							children[i].width = width
							children[i].refresh_Panel(children[i].x, children[i].y, children[i].width, children[i].height, visible)
							child_y += children[i].height
						}
					}
					else {
						let child_y = y
						for (let i = 0; i < count; i++) {
							children[i].x = x
							children[i].y = child_y
							children[i].width = width
							children[i].height = children[i].min_height / total_min_height * height
							children[i].refresh_Panel(children[i].x, children[i].y, children[i].width, children[i].height, visible)
							child_y += children[i].height
						}
					}
				}
				else {
					let child_y = y
					for (let i = 0; i < count; i++) {
						children[i].x = x
						children[i].y = child_y
						children[i].width = width
						children[i].height = children[i].min_height / total_min_height * height
						children[i].refresh_Panel(children[i].x, children[i].y, children[i].width, children[i].height, visible)
						child_y += children[i].height
					}
				}
			}
		}
		else if (this.is_ControlPanel() && this.control_switch) {
			this.x = x
			this.y = y
			this.width = width
			this.height = height
			// console.log("visible", visible)
			let has = false
			for (let i = 0; i < this.children.length; i++) {
				let panel = this.children[i]
				if (panel.name === this.current_panelname) {
					panel.refresh_Panel(this.x, this.y, this.width, this.height, visible)
					if (panel.visible) {
						has = true
					}
				}
				else {
					panel.refresh_Panel(this.x, this.y, this.width, this.height, false)
				}
			}
			if (!has && visible) {
				// console.log(">>>>>>>>>>>>>")
				for (let i = 0; i < this.children.length; i++) {
					let panel = this.children[i]
					if (panel.visible) {
						// console.log(">>>>" + panel.get_Info())
						panel.refresh_Panel(this.x, this.y, this.width, this.height, visible)
						break
					}
				}
			}
			// let panel = this.get_Panel_by_Name(this.current_panelname)
			// console.log(panel)
			// if (panel === null) {
			// 	this.children[0].refresh_Panel(this.x, this.y, this.width, this.height, visible)
			// }
			// else {
			// 	console.log(">>>>")
			// 	panel.refresh_Panel(this.x, this.y, this.width, this.height, visible)
			// }
		}
		return
	}

	split(panelarray, direction = true) {
		if (this.is_ControlPanel()) {
			this.panel_object = null
			this.direction = direction
			this.children = panelarray
			let min_width = 0
			let min_height = 0
			for (let i = 0; i < this.children.length; i++) {
				if (this.children[i].parent !== null && this.children[i].parent !== this) {
					this.children[i].parent.remove_Panel(this.children[i])
				}
				// console.log(this.children[i])
				this.children[i].parent = this
				min_width = Math.max(min_width, this.children[i].min_width)
				min_height = Math.max(min_height, this.children[i].min_height)
			}
			this.min_width = min_width
			this.min_height = min_height
		}
	}

	get_MinWidth() {
		if (this.is_ControlPanel()) {
			let min_width = 0
			if (this.direction && !this.control_switch) {	// H
				for (let i = 0; i < this.children.length; i++) {
					min_width += this.children[i].get_MinWidth()
				}
				this.min_width = min_width
				return this.min_width
			}
			else {					// 	V
				for (let i = 0; i < this.children.length; i++) {
					min_width = Math.max(min_width, this.children[i].get_MinWidth())
				}
				this.min_width = min_width
				return this.min_width
			}
		}
		else {
			return this.visible ? this.min_width : 0
		}
	}

	get_MinHeight() {
		if (this.is_ControlPanel()) {
			let min_height = 0
			if (!this.direction && !this.control_switch) {	// V
				for (let i = 0; i < this.children.length; i++) {
					min_height += this.children[i].get_MinHeight()
				}
				this.min_height = min_height
				return this.min_height
			}
			else {					// 	V
				for (let i = 0; i < this.children.length; i++) {
					min_height = Math.max(min_height, this.children[i].get_MinHeight())
				}
				this.min_height = min_height
				return this.min_height
			}
		}
		else {
			return this.visible ? this.min_height : 0
		}
	}

	get_ExpandX() {
		if (this.is_ControlPanel()) {
			let expand_x = false
			for (let i = 0; i < this.children.length; i++) {
				expand_x = this.children[i].get_ExpandX() || expand_x
			}
			this.expand_x = expand_x
			return this.expand_x
		}
		else {
			return this.visible ? this.expand_x : 0
		}
	}

	get_ExpandY() {
		if (this.is_ControlPanel()) {
			let expand_y = false
			for (let i = 0; i < this.children.length; i++) {
				expand_y = this.children[i].get_ExpandY() || expand_y
			}
			this.expand_y = expand_y
			return this.expand_y
		}
		else {
			return this.visible ? this.expand_y : 0
		}
	}

	get_Visible() {
		if (this.panel_object !== null) {
			this.panel_object.style.visibility = 'hidden'
		}
		if (this.is_ControlPanel() && !this.control_switch) {
			let visible = false
			for (let i = 0; i < this.children.length; i++) {
				visible = visible || this.children[i].get_Visible()
			}
			this.visible = visible
			return this.visible
		}
		else if (this.is_ControlPanel() && this.control_switch) {
			let visible = false
			for (let i = 0; i < this.children.length; i++) {
				visible = visible || this.children[i].visible
			}
			this.visible = visible
			this.switch_Callback()
			return this.visible
		}
		return this.visible
	}

	set_Visible(visible) {
		// if (this.is_ControlPanel()) {
		// 	this.visible = true
		// }
		// else {
		this.visible = visible
		// }
	}

	set_Style(expand_x = true, expand_y = true, min_width = 100, min_height = 100, visible = true) {
		if (min_width !== null)
			this.min_width = min_width
		if (min_height !== null)
			this.min_height = min_height
		if (expand_x !== null)
			this.expand_x = expand_x
		if (expand_y !== null)
			this.expand_y = expand_y
		if (visible !== null)
			this.visible = visible
	}

	is_ControlPanel() {
		return this.panel_id === '' || this.panel_id === null
	}

	has_Panel(panel) {
		if (this.is_ControlPanel()) {
			for (let i = 0; i < this.children.length; i++) {
				if (this.children[i] === panel) {
					return true
				}
			}
			return false
		}
		return false
	}

	get_Panel_Idx(panel) {
		if (this.is_ControlPanel()) {
			for (let i = 0; i < this.children.length; i++) {
				if (this.children[i] === panel) {
					return i
				}
			}
			return -1
		}
		return -1
	}

	get_Panel_by_Name(name) {
		for (let i = 0; i < this.children.length; i++) {
			let panel = this.children[i]
			if (panel.name === name) {
				return panel
			}
		}
		return null
	}

	remove_Panel(panel) {
		if (this.is_ControlPanel()) {
			for (let i = 0; i < this.children.length; i++) {
				if (this.children[i] === panel) {
					this.children.splice(i, 1)
					return panel
				}
			}
		}
	}

	format() {
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].format()
		}


		if (this.is_ControlPanel()) {

			this.children = this.children.filter((item) => {
				if (item.is_ControlPanel() && item.children.length === 0) {
					return false
				}
				return true
			})
			// console.log(this.get_Info(0), this.children)

			if (this.children.length === 0) {
				return
			}

			if (this.children.length === 1) {
				this.switch_Callback()
				let child = this.children[0]
				this.direction = child.direction
				this.panel_id = child.panel_id
				this.name = child.name
				this.on_resize = child.on_resize
				this.expand_x = child.expand_x
				this.expand_y = child.expand_y
				this.min_width = child.min_width
				this.min_height = child.min_height
				this.children = child.children
				this.visible = child.visible
				this.switch_created_callback = child.switch_created_callback
				this.control_switch = child.control_switch
				this.current_panelname = child.current_panelname
				// this.current_panelname = ''
				return
			}

			if (this.control_switch) {
				this.switch_Callback()
			}
		}
		else {
			if (this.switch_created_callback !== null) {
				// console.log(child)
				this.switch_created_callback([{ name: this.name, panelid: this.panel_id }], this.min_width, this.min_height)
			}
			return
		}

		/* let i = 0
		let j = 1
		while (j < this.children.length) {
			let front = this.children[i]
			let current = this.children[j]

			if (front.is_ControlPanel()) {
				if (current.is_ControlPanel()) {
					if (front.direction === current.direction) {
						this.children.splice(j, 1)
						front.children.concat(current.children)
						continue
					}
					else {
						i = j
						j = i + 1
						continue
					}
				}
				else {
					if (this.direction === front.direction) {
						this.children.splice(j, 1)
						front.children.push(current)
						continue
					}
					else {
						i = j + 1
						j = i + 1
						continue
					}
				}
			}
			else {
				if (current.is_ControlPanel()) {
					if (this.direction === current.direction) {
						this.children.splice(i, 1)
						current.children.push(front)
						continue
					}
					else {
						i = j
						j = i + 1
						continue
					}
				}
				else {
					i = j + 1
					j = i + 1
					continue
				}
			}
		}

		if (this.children.length === 1) {
			let child = this.children[0]
			this.direction = child.direction
			this.panel_id = child.panel_id
			this.on_resize = child.on_resize
			this.expand_x = child.expand_x
			this.expand_y = child.expand_y
			this.min_width = child.min_width
			this.min_height = child.min_height
			this.children = child.children
		} */

		return
	}

	update_Parent(parent) {
		this.parent = parent
		if (this.is_ControlPanel()) {
			this.panel_object = null
			for (let i = 0; i < this.children.length; i++) {
				this.children[i].update_Parent(this)
			}
		}
		else {
			this.panel_object = document.getElementById(this.panel_id)
		}
	}

	add_Behind(panel, direction = true) {
		if (this === panel) {
			console.log("error")
			return
		}
		if (this.is_ControlPanel() || panel.is_ControlPanel()) {
			return
		}
		if (panel.parent !== null) {
			panel.parent.remove_Panel(panel)
		}
		if (this.parent.is_ControlPanel() && this.parent.control_switch) {
			let parent = this.parent
			// if (parent.parent !== null) {
			// 	parent.parent.remove_Panel(parent)
			// }
			let that = parent
			let selfPanel = new Panel(that.panel_id, that.name, that.on_resize, that.expand_x, that.expand_y, that.min_width, that.min_height, that.visible, that.switch_created_callback)
			selfPanel.panel_id = that.panel_id
			selfPanel.on_resize = that.on_resize
			selfPanel.min_width = that.min_width
			selfPanel.min_height = that.min_height
			selfPanel.expand_x = that.expand_x
			selfPanel.expand_y = that.expand_y
			selfPanel.children = that.children
			selfPanel.switch_created_callback = that.switch_created_callback
			selfPanel.visible = that.visible
			selfPanel.control_switch = that.control_switch
			selfPanel.current_panelname = that.current_panelname === panel.name ? (selfPanel.children[0] === undefined ? '' : selfPanel.children[0].name) : that.current_panelname

			parent.panel_id = null
			parent.on_resize = null
			parent.min_width = direction ? Math.max(panel.min_width, selfPanel.min_width) : panel.min_width + selfPanel.min_width
			parent.min_height = !direction ? Math.max(panel.min_height, selfPanel.min_height) : panel.min_height + selfPanel.min_height
			parent.expand_x = panel.expand_x || selfPanel.expand_x
			parent.expand_y = panel.expand_y || selfPanel.expand_y
			parent.children = []
			parent.switch_created_callback = null
			parent.visible = panel.visible || self.visible
			parent.control_switch = false
			parent.current_panelname = ''
			// console.log(parent)
			parent.split([selfPanel, panel], direction)
		}
		else {
			let that = this
			let selfPanel = new Panel(that.panel_id, that.name, that.on_resize, that.expand_x, that.expand_y, that.min_width, that.min_height, that.visible, that.switch_created_callback)
			this.panel_id = null
			this.on_resize = null
			this.min_width = direction ? Math.max(panel.min_width, selfPanel.min_width) : panel.min_width + selfPanel.min_width
			this.min_height = !direction ? Math.max(panel.min_height, selfPanel.min_height) : panel.min_height + selfPanel.min_height
			this.expand_x = panel.expand_x || selfPanel.expand_x
			this.expand_y = panel.expand_y || selfPanel.expand_y
			this.children = []
			this.switch_created_callback = null
			this.visible = panel.visible || selfPanel.visible
			this.split([selfPanel, panel], direction)
		}
		// console.log(this.min_width)
	}

	add_Front(panel, direction = true) {
		if (this === panel) {
			console.log("error")
			return
		}
		if (this.is_ControlPanel() || panel.is_ControlPanel()) {
			return
		}
		if (panel.parent !== null) {
			panel.parent.remove_Panel(panel)
		}
		if (this.parent.is_ControlPanel() && this.parent.control_switch) {
			let parent = this.parent
			// if (parent.parent !== null) {
			// 	parent.parent.remove_Panel(parent)
			// }
			let that = parent
			let selfPanel = new Panel(that.panel_id, that.name, that.on_resize, that.expand_x, that.expand_y, that.min_width, that.min_height, that.visible, that.switch_created_callback)
			selfPanel.panel_id = that.panel_id
			selfPanel.on_resize = that.on_resize
			selfPanel.min_width = that.min_width
			selfPanel.min_height = that.min_height
			selfPanel.expand_x = that.expand_x
			selfPanel.expand_y = that.expand_y
			selfPanel.children = that.children
			selfPanel.switch_created_callback = that.switch_created_callback
			selfPanel.visible = that.visible
			selfPanel.control_switch = that.control_switch
			selfPanel.current_panelname = that.current_panelname === panel.name ? (selfPanel.children[0] === undefined ? '' : selfPanel.children[0].name) : that.current_panelname

			parent.panel_id = null
			parent.on_resize = null
			parent.min_width = direction ? Math.max(panel.min_width, selfPanel.min_width) : panel.min_width + selfPanel.min_width
			parent.min_height = !direction ? Math.max(panel.min_height, selfPanel.min_height) : panel.min_height + selfPanel.min_height
			parent.expand_x = panel.expand_x || selfPanel.expand_x
			parent.expand_y = panel.expand_y || selfPanel.expand_y
			parent.children = []
			parent.switch_created_callback = null
			parent.visible = panel.visible || self.visible
			parent.control_switch = false
			parent.current_panelname = ''
			// console.log(parent)
			parent.split([panel, selfPanel], direction)
		}
		else {
			let that = this
			let selfPanel = new Panel(that.panel_id, that.name, that.on_resize, that.expand_x, that.expand_y, that.min_width, that.min_height, that.visible, that.switch_created_callback)
			this.panel_id = null
			this.on_resize = null
			this.min_width = direction ? Math.max(panel.min_width, selfPanel.min_width) : panel.min_width + selfPanel.min_width
			this.min_height = !direction ? Math.max(panel.min_height, selfPanel.min_height) : panel.min_height + selfPanel.min_height
			this.expand_x = panel.expand_x || selfPanel.expand_x
			this.expand_y = panel.expand_y || selfPanel.expand_y
			this.expand_y = panel.expand_y || selfPanel.expand_y
			this.children = []
			this.switch_created_callback = null
			this.visible = panel.visible || self.visible
			this.split([panel, selfPanel], direction)
		}
	}

	make_Switch(panel) {
		if (this === panel) {
			console.log("error")
			return
		}
		if (this.is_ControlPanel() || panel.is_ControlPanel()) {
			return
		}
		if (panel.parent !== null) {
			panel.parent.remove_Panel(panel)
		}
		if (this.parent.is_ControlPanel() && this.parent.control_switch) {
			this.parent.children.push(panel)
			this.parent.control_switch = true
			this.parent.current_panelname = this.parent.children[this.parent.children.length - 1].name
			// this.parent.switch_Callback()
		}
		else {
			let that = this
			let selfPanel = new Panel(that.panel_id, that.name, that.on_resize, that.expand_x, that.expand_y, that.min_width, that.min_height, that.visible, that.switch_created_callback)
			this.panel_id = null
			this.on_resize = null
			this.min_width = Math.max(panel.min_width, selfPanel.min_width)
			this.min_height = Math.max(panel.min_height, selfPanel.min_height)
			this.expand_x = panel.expand_x || selfPanel.expand_x
			this.expand_y = panel.expand_y || selfPanel.expand_y
			this.children = []
			this.switch_created_callback = null
			this.split([selfPanel, panel])
			this.control_switch = true
			this.visible = panel.visible || selfPanel.visible
			this.current_panelname = this.children[this.children.length - 1].name
			// this.switch_Callback()
		}
	}

	switch(name) {
		if (this.is_ControlPanel() && this.control_switch) {
			this.current_panelname = name
		}
	}

	switch_Callback() {
		if (this.is_ControlPanel()) {
			let array = this.children.filter((panel) => { return panel.visible && !panel.is_ControlPanel() }).map((panel) => { return { name: panel.name, panelid: panel.panel_id } })
			this.children.forEach((panel) => {
				// console.log(panel)
				if (panel.switch_created_callback !== null && !panel.is_ControlPanel())
					panel.switch_created_callback(array, panel.min_width, panel.min_height)
			})
		}
	}

	set_Size(width = null, height = null) {
		if (this.is_ControlPanel()) return
		if (width !== null) this.min_width = parseFloat(width)
		if (height !== null) this.min_height = parseFloat(height)
	}

	get_Info(layer = 0) {
		let summary = "";
		for (let i = 0; i < layer; i++) {
			summary += "   ";
		}
		if (this.is_ControlPanel()) {
			return summary + "+ Control " + (this.direction ? "H" : "V") + (this.control_switch ? ' Switch ' + this.current_panelname : '') + '(' + this.visible + ', ' + this.min_width + ", " + this.min_height + ")"
		}
		else {
			return summary + "  Panel " + this.panel_id + ' Name: ' + this.name + ' (' + this.visible + ', ' + this.min_width + ", " + this.min_height + ")"
		}
	}
}

export class Layouter {
	constructor(layout_id, all_panel_id, dragbox = null, margin = 2) {
		this.layout_id = layout_id
		this.layout_main = document.getElementById(this.layout_id)
		this.visible = true
		this.layout_tree = new Panel(null, null)
		this.panel_id_list = all_panel_id
		this.margin = margin * 2
		if (dragbox !== null) {
			this.panel_id_list.forEach((panelid) => {
				// console.log(panelid)
				let object = document.getElementById(panelid)
				if (object !== null) {
					object.addEventListener('dragover', (e) => { this.on_Tab_over(e, panelid) })
					object.addEventListener('dragleave', (e) => { this.on_Tab_leave(e) })
					object.addEventListener('drop', (e) => { this.on_Tab_drop(e, panelid) })
				}

			})
			this.drag_box = dragbox
			// this.drag_box.style.position = 'abusolute'
			// this.drag_box.style.width = '100px'
			// this.drag_box.style.height = '100px'
			// this.drag_box.style.backgroundColor = 'red'
			// this.drag_box.style.zIndex = 10000
			// document.body.appendChild(this.drag_box)
		}
	}

	on_Tab_over(event, panelid) {
		if (!event.ctrlKey) return
		this.drag_box.style.visibility = 'visible'
		let panel = document.getElementById(panelid)
		let x = panel.offsetLeft
		let y = panel.offsetTop
		let width = panel.offsetWidth
		let height = panel.offsetHeight
		let mouse_x = event.clientX - x - this.layout_main.offsetLeft
		let mouse_y = event.clientY - y - this.layout_main.offsetTop
		// console.log(mouse_x, mouse_y)
		switch (this.check(width, height, mouse_x, mouse_y)) {
			case 0:
				this.drag_box.style.left = x + 'px'
				this.drag_box.style.top = y + 'px'
				this.drag_box.style.width = width - this.margin + 'px'
				this.drag_box.style.height = height / 2 - this.margin + 'px'
				break;
			case 1:
				this.drag_box.style.left = x + width / 2 + 'px'
				this.drag_box.style.top = y + 'px'
				this.drag_box.style.width = width / 2 - this.margin + 'px'
				this.drag_box.style.height = height - this.margin + 'px'
				break;
			case 2:
				this.drag_box.style.left = x + 'px'
				this.drag_box.style.top = y + height / 2 + 'px'
				this.drag_box.style.width = width - this.margin + 'px'
				this.drag_box.style.height = height / 2 - this.margin + 'px'
				break;
			case 3:
				this.drag_box.style.left = x + 'px'
				this.drag_box.style.top = y + 'px'
				this.drag_box.style.width = width / 2 - this.margin + 'px'
				this.drag_box.style.height = height - this.margin + 'px'
				break;
			case 4:
				this.drag_box.style.left = x + 'px'
				this.drag_box.style.top = y + 'px'
				this.drag_box.style.width = width - this.margin + 'px'
				this.drag_box.style.height = height - this.margin + 'px'
				break;
			default:
				this.drag_box.style.visibility = 'hidden'
		}
		event.preventDefault()
	}

	on_Tab_leave(event) {
		let x = this.layout_main.offsetLeft
		let y = this.layout_main.offsetTop
		let width = this.layout_main.offsetWidth
		let height = this.layout_main.offsetHeight
		let mouse_x = event.clientX
		let mouse_y = event.clientY
		if (!(x <= mouse_x && mouse_x <= width && y <= mouse_y && mouse_y <= height)) {
			this.drag_box.style.visibility = 'hidden'
		}
	}

	on_Tab_drop(event, panelid) {
		// console.log(event)
		this.drag_box.style.visibility = 'hidden'
		let panelidfrom = event.dataTransfer.getData("Text")
		if (panelidfrom === '') return
		// console.log(panelid, "<-", panelidfrom)
		let to = this.get_Panel_by_ID(panelid)
		let from = this.get_Panel_by_ID(panelidfrom)
		if (to === null || from === null) return
		let panel = document.getElementById(panelid)
		let x = panel.offsetLeft
		let y = panel.offsetTop
		let width = panel.offsetWidth
		let height = panel.offsetHeight
		let mouse_x = event.clientX - x - this.layout_main.offsetLeft
		let mouse_y = event.clientY - y - this.layout_main.offsetTop
		// console.log(this.check(width, height, mouse_x, mouse_y))
		switch (this.check(width, height, mouse_x, mouse_y)) {
			case 0:
				to.add_Front(from, false)
				break;
			case 1:
				to.add_Behind(from, true)
				break;
			case 2:
				to.add_Behind(from, false)
				break;
			case 3:
				to.add_Front(from, true)
				break;
			case 4:
				to.make_Switch(from)
				break;
			default:
				this.drag_box.style.visibility = 'hidden'
		}
		this.format()
		// this.print_Layout()
		this.refresh_Layout()
		event.preventDefault()
	}

	check(width, height, mouse_x, mouse_y) {
		if (0 <= mouse_x && mouse_x <= width && 0 <= mouse_y && mouse_y <= height) {
			if (mouse_y <= height / 3) {
				return 0
			}
			else if (mouse_y <= height / 3 * 2) {
				if (mouse_x <= width / 3) {
					return 3
				}
				else if (mouse_x <= width / 3 * 2) {
					return 4
				}
				else {
					return 1
				}
			}
			else {
				return 2
			}
		}
		return null
	}

	format() {
		this.layout_tree.format()
		this.layout_tree.update_Parent(null)
	}

	set_Visible(visible) {
		this.visible = visible
	}

	refresh_Layout() {
		if (this.drag_box !== undefined) { this.drag_box.style.visibility = 'hidden' }
		if (this.layout_main === null) {
			console.error("Invaild Layouter mainlayoutelement")
			return
		}
		this.layout_tree.get_MinWidth()
		this.layout_tree.get_MinHeight()
		this.layout_tree.get_ExpandX()
		this.layout_tree.get_ExpandY()
		this.layout_tree.get_Visible()
		this.layout_tree.refresh_Panel(0, 0, this.layout_main.offsetWidth, this.layout_main.offsetHeight, this.visible)
	}

	get_AllPanel() {
		let panel_array = new Array()
		let panel_stack = new Array()
		panel_stack.push(this.layout_tree)
		while (panel_stack.length > 0) {
			let current_panel = panel_stack.shift()
			if (!current_panel.is_ControlPanel()) {
				panel_array.push(current_panel)
			}
			if (current_panel.is_ControlPanel()) {
				for (let i = 0; i < current_panel.children.length; i++) {
					panel_stack.push(current_panel.children[i])
				}
			}
		}
		return panel_array
	}

	get_Panel_by_ID(panel_id) {
		let panel_stack = new Array()
		panel_stack.push(this.layout_tree)
		while (panel_stack.length > 0) {
			let current_panel = panel_stack.pop()
			if (!current_panel.is_ControlPanel() && current_panel.panel_id === panel_id) {
				return current_panel
			}
			if (current_panel.is_ControlPanel()) {
				for (let i = 0; i < current_panel.children.length; i++) {
					panel_stack.push(current_panel.children[i])
				}
			}
		}
		return null
	}

	print_Layout() {
		let panel_stack = new Array()
		let layerstack = new Array;
		panel_stack.push(this.layout_tree)
		layerstack.push(0);
		while (panel_stack.length > 0) {
			let current_panel = panel_stack.pop()
			let current_layer = layerstack.pop();
			let line = current_panel.get_Info(current_layer)
			//  + "  parent:" + (current_panel.parent === null ? "Main" : current_panel.parent.get_Info(0))
			console.log(line)
			// console.log(current_panel)
			if (current_panel.is_ControlPanel()) {
				for (let i = 0; i < current_panel.children.length; i++) {
					panel_stack.push(current_panel.children[i])
					layerstack.push(current_layer + 1)
				}
			}
		}
	}
}