export class Slot {
	constructor(
		id,
		name,
		position = new THREE.Vector3(0, 0, 0),
		rotation = new THREE.Euler(0, 0, 0, "XYZ"),
		scene,
		property = { angleMin: 0, angleMax: 0, yMin: 0, yMax: 0 },
		classificationid = null) {

		// the type of this object
		this.type = 'Slot';
		// unique id
		this.uid = UniqueID;
		UniqueID++;
		// id (in an Component it should be unique)
		this.id = id;
		// the name of a slot
		this.name = get_SlotName_Legacy(name);
		// the classification of a slot or which classification of Module is allowed to be connected to it
		this.classificationid = (classificationid === null) ? map_Slot_Legacy(this.name) : classificationid;

		// the tree pointer
		// the Module it belongs to (which Component it's in)
		this.belong = null;

		// the Module connected to it, muliple Modules is allow so its an Array<Module>
		this.connectedmodule = new Array();

		// the Modules link to this slots
		this.linkedby = new Array();

		// the THREE.Scene it's in
		this.scene = scene;

		// the slot local Position / Rotation (related to its owner who belongs it)
		// it will auto re-calculate after the Update method
		this.position = position;
		this.rotation = rotation;

		// the slot's world Position / Rotation (related to the World Origin)
		this.world_position = new THREE.Vector3(0, 0, 0);
		this.world_rotation = new THREE.Euler(0, 0, 0, "XYZ");

		// the yMin,yMax,angleMin, angleMax of the slot
		// the polearm used those four properties to select which slot to connect
		this.property = {};

		// if a slot is polearm type it will auto calculate those properties
		if (this.classificationid === 2) {
			if (property.yMin !== undefined && property.yMax !== undefined && property.angleMin !== undefined && property.angleMax !== undefined) this.property = property
			else {
				let up = (new THREE.Vector3(0, 1, 0)).applyEuler(this.rotation)
				let angle = Module.to_HSL(up).angle
				this.property = { angleMin: angle, angleMax: angle, yMin: Math.floor(this.position.y / Unit), yMax: Math.ceil(this.position.y / Unit) }
			}
		}

		// used in the editor of any kinds of operations, middle values etc.
		// use this if you don't want to pollute the property scope
		this.editorproperty = {};

		// the SphereGeometry used to illustrate the slot and pick mouse hover event
		this.helper = new THREE.Mesh(slothelper, new THREE.MeshBasicMaterial({ color: '#00ff00' }));
		this.helper.visible = false;
		this.helper.castShadow = false;
		this.helper.receiveShadow = false;

		// slot's pos/rot illustration
		if (this.scene !== null) {
			this.axishelper = new THREE.Object3D();
			this.axishelper.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 5, 0xff0000, 1, 1));
			this.axishelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 5, 0x00ff00, 1, 1));
			this.axishelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 5, 0x0000ff, 1, 1));
			this.axishelper.visible = false;
			// Init
			Slot.add_to_Scene(this)
		}
	}
	// Events
	bubble(bub) {
		if (this.belong !== null) {
			this.belong.bubble(bub);
		}
	}

	// Methods

	// check whether there is a loop in the "Tree" Structure
	check_Loop(module) {
		// a First Order Traverse
		let slotstack = new Array();
		for (let i = module.slotlist.length - 1; i >= 0; i--) {
			if (module.slotlist[i] == this) return true;
			slotstack.push(module.slotlist[i]);
		}
		while (slotstack.length > 0) {
			let current_slot = slotstack.pop();
			// we found the start in its own sub tree so there is a loop
			if (current_slot == this) return true;
			for (let j = 0; j < current_slot.connectedmodule.length; j++) {
				let current_module = current_slot.connectedmodule[j];
				for (let i = current_module.slotlist.length - 1; i >= 0; i--) {
					slotstack.push(current_module.slotlist[i]);
				}
			}
		}
		return false;
	}

	// connect a module to this slot
	// auto loop check so it may fail but it will not throw an exception but rather console.error inthe console
	// since it rarely possible to make a loop in the connect in the Editor
	connect(module, addtoscene = false) {
		if (module === null) return;
		if (module.connectedslot !== null && module.connectedslot !== undefined) {
			let info = "%cERROR%c This module already connected to other slot\n" + "  try to Connect: %cModule%c" + module.id + ", " + module.name + "%c -> " + "%cSlot%c" + this.id + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			return;
		}
		if (this.check_Loop(module)) {
			let info = "%cERROR%c Loop connection\n" + "  try to Connect: %cModule%c" + module.id + ", " + module.name + "%c -> " + "%cSlot%c" + this.id + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
		} else {
			this.connectedmodule.push(module);
			module.connectedslot = this;
			this.bubble({
				event: 'connect',
				target: module,
				direct: true,
				mainpath: true
			})
		}
	}

	// disconnect a module from this slot
	// the link in the main tree and the disconnected subtree will be auto discarded
	disconnect(module, removefromscene = false) {
		if (module === null) return;
		let i = 0;
		let connectedmodule = null;
		while (i < this.connectedmodule.length) {
			if (this.connectedmodule[i] === module) {
				module.connectedslot = null;
				connectedmodule = module
				this.connectedmodule.splice(i, 1);

				// link
				let linkarray = new Array();
				let slotslist = new Array();
				connectedmodule.Traverse((module) => {
					if (module.is_Link()) {
						linkarray.push(module);
					}
				},
					(slot) => {
						slotslist.push(slot);
					});
				// //console.log(slotslist, linkarray)
				// //console.log(linkarray, slotslist);
				linkarray.forEach((module) => {
					let i = 0;
					module.bubble({
						event: 'discard-link',
						target: module,
						mainpath: true
					})
					while (i < module.linkslotlist.length) {
						let slot = module.linkslotlist[i];
						if (!slotslist.includes(slot)) {
							module.discard_Link(slot);
							continue;
						}
						i++;
					}
				});
				slotslist.forEach((linkedslot) => {
					let i = 0;
					while (i < linkedslot.linkedby.length) {
						let module = linkedslot.linkedby[i];
						if (!linkarray.includes(module)) {
							module.bubble({
								event: 'discard_link',
								target: module,
								mainpath: false
							})
							module.discard_Link(linkedslot);
							continue;
						}
						i++;
					}
				});

				this.bubble({
					event: 'disconnect',
					target: module,
					direct: true,
					mainpath: true
				})

				return connectedmodule;
			}
			i++;
		}
		let info = "%cERROR%c This module is not connected to the slot\n" + "  try to Disonnect: %cModule%c" + module.id + ", " + module.name + "%c <- " + "%cSlot%c" + this.id + ", " + this.name;
		console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
		return;
	}
}

export class Module {
	// para : cid, id, name, shiftposition, shiftrotation, scene, modelpath, unit, slotmodifier, relatetoorigin
	constructor(
		componentid,
		id,
		name,
		shiftposition = new THREE.Vector3(0, 0, 0),
		shiftrotation = new THREE.Euler(0, 0, 0, "XYZ"),
		scene = null,
		path = "",
		slotmodifier = new SM_Free(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ")),
		relatetoorigin = false,
		classification = '主杆',
		property = { version: '', 关联组件: '0', 杆高: '1', 材质: '钢' },
		groupid = -1,
		orgType = 0) {

		// event

		// Module or Slot
		this.type = 'Module';
		// componentId to Identifie a Component (like 2F-486, every 2F instances' cids are all 486)
		this.componentid = componentid;

		// GroupID the components in the same group will have the same groupid, each group has its own unique groupid
		// default groupid = -1 means not in a group
		this.groupid = groupid;
		// UID unique in each ModuleSlotTee , its BigInt type
		// same cid will have different uid
		this.uid = UniqueID;
		UniqueID++;
		// ID here it can be the poleID
		this.id = id;
		// Name
		this.name = name;
		this.classification = classification;
		this.classificationid = map_Classsification(classification);
		// property
		this.property = JSON.parse(JSON.stringify(property));

		this.emitter = new EventEmitter(`module ${this.uid} bubble`)
		// same as Slot.editorworkspace
		this.editorworkspace = {
			explodeAxis: new THREE.Vector3(0, 1, 0)
		};

		if ([3, 4, 5, 6].includes(this.classificationid)) {
			this.editorworkspace.explodeAxis = new THREE.Vector3(1, 0, 0)
		}

		// Plugin
		this.editorproperty = {};

		// Editable Property used for create module-diff-editable property, but plugin is not nesseary
		// eg.
		// 2F - SF-size
		// 搭载设备 - 设备编号
		this.editableproperty = {};

		this.regulate_Property();

		// Model's url
		this.url = path;

		// SlotModifier
		this.slotmodifier = slotmodifier;

		// slots attach to it
		this.slotlist = new Array();

		// slots it references to
		this.linkslotlist = new Array();

		// model's world postion
		this.shiftposition = shiftposition;
		// model's world rotation
		this.shiftrotation = shiftrotation;
		// parent in ComponentTree
		this.connectedslot = null;
		// Model
		this.model = null;
		// Highlight Line Model
		this.line = null;
		// the THREE.Scene it be added to
		this.scene = scene;

		// flags
		this.allowadditionalposition = true;
		// calcu position/rotation from world or this parent
		this.relatetoorigin = relatetoorigin;
		// the way to calcu the slot references
		// parent whether take its connectedslot in to considration
		// x,y,z average on each axis
		this.linkcalcustyle = { parent: true, x: false, y: true, z: false };
		this.is_highlighted = false;
		this.is_visible = false;
		this.is_in_scene = false;
		this.is_disposed = false;
		this.is_loading = false;
		this.highlight_color = '#ff9800';
		this.model_color = '#ffffff';
		this.model_opacity = 1;
		this.model_scale = new THREE.Vector3(1, 1, 1);

		// auto calcu position rotation
		// model
		this.model_world_position = new THREE.Vector3(0, 0, 0);
		this.model_world_rotation = new THREE.Euler(0, 0, 0, "XYZ");
		// parent slot without linkslots
		this.slot_world_position = new THREE.Vector3(0, 0, 0);
		this.slot_world_rotation = new THREE.Euler(0, 0, 0, "XYZ");
		// parent slot with linkslots
		this.world_position = new THREE.Vector3(0, 0, 0);
		this.world_rotation = new THREE.Euler(0, 0, 0, "XYZ");

		// equipid for this.classificationid === 6
		this.defaultequipId = initialequipId
		this.orgType = orgType

		// rules when connecting the modules
		this.rules = {
			// 在选择插槽的时候是否以热区显示
			get_Module: (this.classification === '横臂' || this.classification === '副杆' || this.classification === '主杆' || this.classification === '微型杆'),
			// 在选择插槽的时候，需要显示组件的哪些插槽，为函数，输入this（组件本身）
			get_Slots: (this.classification === '横臂' || this.classification === '副杆') ? new Function('module', "return [];") : new Function('module', "return module.get_Slots(false, true);"),
			// 热区所代表的插槽，为函数，输入this、classcificaion
			get_DefaultSlot: get_DefaultSlotFunction(this.classification),
			// 插槽和组件能否相连，为函数，输入this, slot, base, scenedata
			check_Slot: get_CheckSlotFunction(this.classification),
			// 初始化，为函数，输入this、scenedata
			on_Arm: new Function('module', 'scenedata', "module.slotmodifier.position.set(0,0,0);module.slotmodifier.rotation.set(0,0,0);"),
		}

		// Init
		// attach a "原点插槽"
		if (this.name !== 'Base') {
			this.add_Slot(new Slot(-1, "原点插槽", new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, "XYZ"), this.scene, undefined, -1))
		}

		if (this.classificationid === 6) {
			// //console.log("this.defaultequipId",this.defaultequipId)
			this.add_EditableProperty('设备编号', 'string', this.defaultequipId, function (val, module) {
				this.data = val
				return false
			}, function () {
				return { equipId: this.data }
			})

			// 获取权属单位列表
			let orgTypeData = {
				selectitem: {},
				list: []
			}
			let param = {
				typeIdList: [23]
			}

			let that = this
			searchDicDetailList(param).then(response => {
				//console.log(response)
				if (response.respCode === 0 && response.returns) {
					that.orgTypeList = response.returns
					orgTypeData.list = response.returns
					for (let i = 0; i < orgTypeData.list.length; i++) {
						orgTypeData.list[i].code = orgTypeData.list[i].dicCode
						orgTypeData.list[i].text = orgTypeData.list[i].dicValue
						// 权属单位没有传入时默认字典第一个值，传入时匹配字典
						if ((!that.orgType && orgTypeData.list[i].dicCode === 0) || (that.orgType === orgTypeData.list[i].dicCode)) {
							orgTypeData.selectitem = orgTypeData.list[i]
						}
					}
				}

				this.add_EditableProperty('权属单位', 'dropdown2', orgTypeData, function (val, module) {
					this.data = val
					return false
				}, function () {
					return { orgType: this.data }
				})
			});

			initialequipId = initialequipId + 1
			// //console.log("initialequipId",initialequipId)
		}
		if (this.classificationid === 4) {
			this.add_EditableProperty('灯臂仰角', 'number', 0, function (val, module) {
				this.data = val
				return false
			}, function () {
				return { elevationAngle: this.data }
			})
		}

		// auto add to Scene, Lazy you can call this when the model is not loaded, it will be added automatically once it is loaded
		if (this.scene !== null) {
			Module.add_to_Scene(this);
			// set construct url to "" in order to call load_Mesh mannually, this will return a promise
			// this is useful when you have to mannually control the load processes
			if (this.url != "") {
				this.load_Mesh(this.url).then((resolve) => {
					// customLog(undefined, 'log', 'ModuleSlot.js', '加载模型', Module.get_StyledHTML(this) + ' 加载模型 ' + HTML.create_KeyPair('URL', this.url, 'String') + ' 成功')
				}, (error) => {
					customLog(undefined, 'error', 'ModuleSlot.js', '加载模型', Module.get_StyledHTML(this) + ' 加载模型 ' + HTML.create_KeyPair('URL', this.url, 'String') + ' 失败')
				})
			}
		}
	}
	// events
	bubble(bub) {
		let bubtemplate = { ...bub }
		let passive = true
		bubtemplate.direct = false
		bub.stop = () => {
			passive = false
		}
		this.fire_Bub(bub);
		if (!passive) return
		//
		let parent = this.get_Parent()
		if (parent !== null) {
			parent.bubble({ ...bubtemplate })
		}
		this.linkslotlist.forEach((slot) => {
			let bubs = { ...bubtemplate }
			bubs.mainpath = false
			slot.bubble(bubs)
		})
	}

	fire_Bub(bub) {
		// console.warn(`${this.get_Info()} - %c${bub.event}%c${bub.direct ? 'direct' : 'not direct'}%c- ${bub.mainpath ? 'mainpath' : 'linkpath'} - ${bub.target.get_Info()}`, "background-color: yellow;", "background-color: blue; color: white;", "")
		this.emitter.trigger(bub)
		// console.log(bub)
	}

	bind(event, callback, options) {
		let { mainpath = true, linkpath = true, direct = false, stop = false } = options
		let func = (bub) => {
			if (bub.event !== event) return
			if ((bub.mainpath && mainpath) || (!bub.mainpath && linkpath)) {
				if (direct && bub.direct || !direct) {
					callback(bub)
				}
			}
			if (stop) {
				bub.stop()
			}
		}
		return this.emitter.bind(func)
	}

	set_SlotModifier(...param) {
		let changed = this.slotmodifier.set(...param)
		if (changed) {
			this.bubble({
				event: 'slotmodifier-changed',
				target: this,
				mainpath: true
			})
		}
	}

	// ref a slot
	make_Link(slot) {
		if (!(slot instanceof Slot) || slot === null) return;
		if (slot.belong === this) {
			let err = "在 <尝试创建驱动> " + Slot.get_StyledHTML(slot) + " <<< " + Module.get_StyledHTML(this) + '<ul><li>无法创建组件和该组件的插槽间的驱动关系</li></ul>';
			let info = "%cERROR%c Cannot make a link between a module and its own slot\n" + "  try to Make Link: %cSlot%c" + slot.uid + ", " + slot.name + "%c <- " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			throw new Error(err)
			return;
		}
		if (slot === this.connectedslot) {
			let err = "在 <尝试创建驱动> " + Slot.get_StyledHTML(slot) + " <<< " + Module.get_StyledHTML(this) + '<ul><li>无法创建组件和该组件的组装树父级插槽间的驱动关系</li></ul>';
			let info = "%cERROR%c Cannot make a link between a module and its connected slot\n" + "  try to Make Link: %cSlot%c" + slot.uid + ", " + slot.name + "%c <- " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			throw new Error(err)
			return;
		}
		if (this.check_Link_Loop(slot)) {
			let err = "在 <尝试创建驱动> " + Slot.get_StyledHTML(slot) + " <<< " + Module.get_StyledHTML(this) + '<ul><li>无法创建组件和插槽间的驱动关系 在该组件的被驱动链上已存在该组件</li></ul>';
			let info = "%cERROR%c Loop Link\n" + "  try to Make Link: %cSlot%c" + slot.uid + ", " + slot.name + "%c <- " + "%cModule%c" + this.uid + ", " + this.name;
			console.error(info, "padding: 2px 8px ; background-color:rgb(233, 40, 50); border-radius: 4px; color:white;font-weight:bold;", "", "padding: 2px 8px ; background-color:rgb(24, 170, 90); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;", "", "padding: 2px 8px ; background-color:rgb(60, 80, 240); border-radius: 4px 0px 0px 4px; color:white;font-weight:bold;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 4px 4px 0px; color: white;");
			throw new Error(err)
			return;
		}
		if (!this.has_LinkSlot(slot)) {
			this.linkslotlist.push(slot);
			slot.linkedby.push(this);
			this.bubble({
				event: 'link',
				target: this,
				direct: true,
				mainpath: true
			})
		}
		// //console.log(">>>>>>>>> Maked Link")
	}

	// remove the reference to a slot
	discard_Link(slot) {
		if (!(slot instanceof Slot) || slot === null) return;
		if (this.has_LinkSlot(slot)) {
			let i = 0;
			while (i < this.linkslotlist.length) {
				if (this.linkslotlist[i] === slot) {
					let slottarget = this.linkslotlist[i];
					let j = 0;
					while (j < slottarget.linkedby.length) {
						if (slottarget.linkedby[j] === this) {
							slottarget.linkedby.splice(j, 1);
							continue;
						}
						j++;
					}
					this.linkslotlist.splice(i, 1);
					continue;
				}
				i++;
			}

		}
	}

}
