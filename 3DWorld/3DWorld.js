export const PositionType = {
	/**
	 * 笛卡尔坐标系
	 */
	XYZ: 'XYZ',
	/**
	 * 柱面坐标系
	 */
	HSL: 'HSL'
}
export const AngleType = {
	/**
	 * 角度
	 */
	DEG: 'DEG',
	/**
	 * 弧度
	 */
	RAD: 'RAD',
	/**
	 * PI 的倍数 1表示180°， 0.5表示90°
	 */
	XPI: 'XPI'
}
export const PlaneType = {
	'XZ-Y': 'XZ-Y',
	'XZ+Y': 'XZ+Y',
}

export function ROUND(number, precision) {
	return Math.round(number / precision) * precision
}

export class Angle {
	constructor(angle, type = AngleType.DEG) {
		this.angle = angle;
		this.type = type;
		this.round();
	}

	static convert_to_DEG = {
		DEG: (a) => {
			return a
		},
		RAD: (a) => {
			a.angle = a.angle / Math.PI * 180
			a.type = 'DEG'
			return a
		},
		XPI: (a) => {
			a.angle = a.angle * 180
			a.type = 'DEG'
			return a
		}
	}
	static convert_from_DEG = {
		DEG: (a) => {
			return a
		},
		RAD: (a) => {
			a.angle = a.angle / 180 * Math.PI
			a.type = 'RAD'
			return a
		},
		XPI: (a) => {
			a.angle = a.angle / 180
			a.type = 'XPI'
			return a
		}
	}

	static FULL_CIRCLE = {
		DEG: 360,
		RAD: Math.PI * 2,
		XPI: 2
	}

	round() {
		if (this.angle >= 0)
			this.angle %= Angle.FULL_CIRCLE[this.type];
		else {
			let count = Math.ceil(-this.angle / Angle.FULL_CIRCLE[this.type]);
			this.angle += count * Angle.FULL_CIRCLE[this.type];
		}
		return this;
	}

	to(type) {
		let origin = this.clone();
		return (Angle.convert_from_DEG[type](Angle.convert_to_DEG[origin.type](origin))).round();
	}

	toNumber(type) {

	}

	clone() {
		return new Angle(this.angle, this.type);
	}

	sin() {
		let angle = this.to('RAD').angle;
		return Math.sin(angle);
	}

	cos() {
		let angle = this.to('RAD').angle;
		return Math.cos(angle);
	}

	toPosition(plane = 'XZ+Y') {
		let sin = this.sin();
		let cos = this.cos();
		switch (plane) {
			case 'XZ-Y': {
				return new Position(cos, 0, sin, 'XYZ');
			}
			case 'XZ+Y': {
				return new Position(cos, 0, -sin, 'XYZ');
			}
		}
	}

	static fromPosition(position) {
		let x = position.x;
		let z = position.z;
		return new Angle(Math.atan2(-z, x), 'RAD');
	}

	toNumber(round) {
		if (round !== undefined) return ROUND(this.angle, round);
		return this.angle;
	}
}

export class Position {
	constructor(x, y, z, type = PositionType.XYZ) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.type = type;
	}

	static convert_to_XYZ = {
		XYZ: (p) => {
			return p
		},
		HSL: (p) => {
			let angle = p.x;
			let xzpos = angle.toPosition().mult(p.y);
			xzpos.type = 'XYZ';
			xzpos.y = p.z;
			return xzpos;
		}
	}
	static convert_from_XYZ = {
		XYZ: (p) => {
			return p
		},
		HSL: (p) => {
			let angle = Angle.fromPosition(p);
			let dis = Math.hypot(p.x, p.z);
			p.x = angle;
			p.z = p.y;
			p.y = dis;
			p.type = 'HSL';
			return p
		}
	}

	to(type) {
		let origin = this.clone();
		return Position.convert_from_XYZ[type](Position.convert_to_XYZ[origin.type](origin));
	}

	clone() {
		return new Position(this.x, this.y, this.z, this.type);
	}

	mult(num) {
		let origin = this.clone().to('XYZ');
		origin.x *= num;
		origin.y *= num;
		origin.z *= num;
		return origin.to(this.type);
	}

	toObject(round) {
		switch (this.type) {
			case 'XYZ':
				return {
					x: round === undefined ? this.x : ROUND(this.x, round),
					y: round === undefined ? this.y : ROUND(this.y, round),
					z: round === undefined ? this.z : ROUND(this.z, round),
				}
			case 'HSL':
				return {
					angle: this.x.to('DEG').toNumber(round),
					radius: round === undefined ? this.y : ROUND(this.y, round),
					height: round === undefined ? this.z : ROUND(this.z, round),
				}
		}
	}
}

let angle = new Angle(45)
let a = (new Position(angle, 80, 100, 'HSL')).to('XYZ')
console.log(a.toObject(0.0001))