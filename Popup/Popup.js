export class PopupWindow {
	constructor(area_div, drag_div, resize_div, container_div, title_div, resize_func = null, showhide_func = null, needclamp = true, resize_offestX = 0, resize_offestY = 0) {
		this.area_div = document.getElementById(area_div)
		this.drag_div = document.getElementById(drag_div)
		this.resize_div = document.getElementById(resize_div)
		this.container_div = document.getElementById(container_div)
		this.title_div = document.getElementById(title_div)
		this.resize_func = resize_func
		this.showhide_func = showhide_func
		this.needclamp = needclamp
		this.resize_offestX = resize_offestX
		this.resize_offestY = resize_offestY
		this.container_X = 0
		this.container_Y = 0
		this.lastpos_X = 0
		this.lastpos_Y = 0
		this.resize_X = 0
		this.resize_Y = 0
		this.is_dragging = false
		this.is_resizing = false
		this.is_center = false
		this.resizeable = true

		// this.visible_func(false)
		this.container_div.style.visibility = 'hidden'

		this.mousemove_func = () => { this.on_Mouse_Move(event) }
		this.mouseup_func = () => { this.on_Mouse_Release(event) }
		this.mousedown_func = () => { this.on_Mouse_Click(event) }
		this.mousedbclick_func = () => { this.on_Mouse_Double_Click(event) }
		this.windowresize_func = () => { this.on_Window_Resize() }
		this.resizedown_func = () => { this.on_Resize_Click(event) }

		this.resize(this.container_div.offsetWidth, this.container_div.offsetHeight)
	}

	on_Mouse_Release(event) {
		// console.log(">> Release")
		this.is_dragging = false
		this.is_resizing = false
	}

	on_Mouse_Click(event) {
		// console.log(">> Click")
		this.lastpos_X = event.clientX
		this.lastpos_Y = event.clientY
		this.container_X = this.container_div.offsetLeft
		this.container_Y = this.container_div.offsetTop
		this.is_dragging = true

	}

	on_Mouse_Double_Click(event) {
		this.center()
	}

	on_Resize_Click(event) {
		if (this.resizeable) {// console.log(">> Resize Click")
			this.lastpos_X = event.clientX
			this.lastpos_Y = event.clientY
			this.resize_X = this.resize_div.offsetLeft
			this.resize_Y = this.resize_div.offsetTop
			this.is_resizing = true
		}
	}

	on_Mouse_Move(event) {
		// console.log(">> Dragging " + that.is_dragging)
		if (this.is_dragging) {
			// console.log(">> dragging")
			let newpos_X = this.container_X + event.clientX - this.lastpos_X
			let newpos_Y = this.container_Y + event.clientY - this.lastpos_Y
			if (this.needclamp) {
				if (newpos_X < 0) newpos_X = 0
				if (newpos_X + this.container_div.offsetWidth > this.area_div.offsetWidth) newpos_X = this.area_div.offsetWidth - this.container_div.offsetWidth
				if (this.container_div.offsetWidth > this.area_div.offsetWidth) newpos_X = 0
				if (newpos_Y < 0) newpos_Y = 0
				if (newpos_Y + this.container_div.offsetHeight > this.area_div.offsetHeight) newpos_Y = this.area_div.offsetHeight - this.container_div.offsetHeight
				if (this.container_div.offsetHeight > this.area_div.offsetHeight) newpos_Y = 0
			}
			this.container_div.style.left = newpos_X + 'px'
			this.container_div.style.top = newpos_Y + 'px'
			// this.lastpos_X = event.clientX
			// this.lastpos_Y = event.clientY
			this.is_center = false
			// this.drag_div.offsetTop += event.clientY - this.lastpos_Y
		}
		if (this.resizeable && this.is_resizing) {
			// console.log(">> dragging")
			let newpos_X = this.resize_X + event.clientX - this.lastpos_X
			let newpos_Y = this.resize_Y + event.clientY - this.lastpos_Y
			// if (this.needclamp) {
			// 	if (newpos_X < 0) newpos_X = 0
			// 	if (newpos_X + this.container_div.offsetWidth > this.area_div.offsetWidth) newpos_X = this.area_div.offsetWidth - this.container_div.offsetWidth
			// 	if (this.container_div.offsetWidth > this.area_div.offsetWidth) newpos_X = 0
			// 	if (newpos_Y < 0) newpos_Y = 0
			// 	if (newpos_Y + this.container_div.offsetHeight > this.area_div.offsetHeight) newpos_Y = this.area_div.offsetHeight - this.container_div.offsetHeight
			// 	if (this.container_div.offsetHeight > this.area_div.offsetHeight) newpos_Y = 0
			// }
			this.resize_div.style.left = newpos_X + 'px'
			this.resize_div.style.top = newpos_Y + 'px'

			this.resize(newpos_X - this.resize_offestX, newpos_Y - this.resize_offestY)
			// this.lastpos_X = event.clientX
			// this.lastpos_Y = event.clientY
			this.is_center = false
			// this.drag_div.offsetTop += event.clientY - this.lastpos_Y
		}
	}

	on_Window_Resize() {
		if (this.is_center) {
			this.center()

		}
		this.resize(this.container_div.offsetWidth, this.container_div.offsetHeight)
	}

	bind_Event() {
		window.addEventListener('mousemove', this.mousemove_func)
		window.addEventListener('mouseup', this.mouseup_func)
		window.addEventListener('resize', this.windowresize_func)
		this.drag_div.addEventListener('mousedown', this.mousedown_func)
		this.drag_div.addEventListener('dblclick', this.mousedbclick_func)
		this.resize_div.addEventListener('mousedown', this.resizedown_func)
	}

	release_Event() {
		window.removeEventListener('mousemove', this.mousemove_func)
		window.removeEventListener('mouseup', this.mouseup_func)
		window.removeEventListener('resize', this.windowresize_func)
		this.drag_div.removeEventListener('mousedown', this.mousedown_func)
		this.drag_div.removeEventListener('dblclick', this.mousedbclick_func)
		this.resize_div.removeEventListener('mousedown', this.resizedown_func)
		this.on_Mouse_Release()
	}

	center() {
		this.container_div.style.left = (this.area_div.offsetWidth - this.container_div.offsetWidth) / 2 + 'px'
		this.container_div.style.top = (this.area_div.offsetHeight - this.container_div.offsetHeight) / 2 + 'px'
		this.is_center = true
	}

	resize(width, height) {
		if (width >= this.area_div.offsetWidth) width = this.area_div.offsetWidth
		if (width < 200) width = 200
		if (height >= this.area_div.offsetHeight) height = this.area_div.offsetHeight
		if (height < 100) height = 100

		this.container_div.style.width = width + 'px'
		this.container_div.style.height = height + 'px'

		let newpos_X = this.container_div.offsetLeft
		let newpos_Y = this.container_div.offsetTop
		if (this.needclamp) {
			if (newpos_X < 0) newpos_X = 0
			if (newpos_X + this.container_div.offsetWidth > this.area_div.offsetWidth) newpos_X = this.area_div.offsetWidth - this.container_div.offsetWidth
			if (this.container_div.offsetWidth > this.area_div.offsetWidth) newpos_X = 0
			if (newpos_Y < 0) newpos_Y = 0
			if (newpos_Y + this.container_div.offsetHeight > this.area_div.offsetHeight) newpos_Y = this.area_div.offsetHeight - this.container_div.offsetHeight
			if (this.container_div.offsetHeight > this.area_div.offsetHeight) newpos_Y = 0
		}
		this.container_div.style.left = newpos_X + 'px'
		this.container_div.style.top = newpos_Y + 'px'

		// console.log(width + this.reszie_offestX)

		this.resize_div.style.left = (width + this.resize_offestX) + 'px'
		this.resize_div.style.top = (height + this.resize_offestY) + 'px'

		this.resize_func(this.container_div.offsetLeft, this.container_div.offsetTop, this.container_div.offsetWidth, this.container_div.offsetHeight)
	}

	set_Resizeable(resizeable) {
		this.resizeable = resizeable
		if (!this.resizeable) {
			this.on_Mouse_Release()
			this.resize(this.container_div.offsetWidth, this.container_div.offsetHeight)
			this.resize_div.style.cursor = "default"
		}
		else {
			this.resize_div.style.cursor = "nwse-resize"
		}
	}

	popup(show = true, exclusive = true) {
		if (show) {
			this.container_div.style.visibility = 'visible'
			this.bind_Event()
			if (exclusive) {
				this.area_div.classList.add('active')
			}
			this.showhide_func(true)
		}
		else {
			this.container_div.style.visibility = 'hidden'
			this.release_Event()
			this.area_div.classList.remove('active')
			this.showhide_func(false)
		}

	}

	set_Title(string) {
		this.title_div.innerHTML = string
	}
}