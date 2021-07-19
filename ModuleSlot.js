class BoxAlignHelper extends THREE.Object3D {
	constructor(object) {
		super()
		this.box = new THREE.Box3();
		this.dashMaterial = new THREE.LineDashedMaterial({
			color: 'yellow',
			linewidth: 2,
			dashSize: 10,
			gapSize: 10
		})
		this.soildMaterial = new THREE.LineBasicMaterial({
			color: '#00ff00',
			linewidth: 2,
		})
		if (object) {
			this.box.setFromObject(object);
		}
		const points = [];
		points.push(new THREE.Vector3(0, 0, 0));
		points.push(new THREE.Vector3(0, 1, 0));

		this.geometry = new THREE.BufferGeometry().setFromPoints(points);
		this.centerLineV = new THREE.Line(this.geometry, this.dashMaterial);
		this.centerLineV2 = new THREE.Line(this.geometry, this.soildMaterial);
		this.add(this.centerLineV)
		this.add(this.centerLineV2)
		this.centerLineV.position.y = 20;
		this.centerLineV.scale.y = 10;
		this.centerLineV2.scale.y = 20;

		const node = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		node.setAttribute('stroke', 'white');
		// node.setAttribute('stroke-wdith', '2');
		node.setAttribute('fill', 'red');
		node.setAttribute('x1', '-10');
		node.setAttribute('y1', '0');
		node.setAttribute('x2', '10');
		node.setAttribute('y2', '0');
		node.style.strokeLinecap = 'round'
		node.style.strokeWidth = 2
		this.circle1 = new SVGObject(node.cloneNode())
		this.circle2 = new SVGObject(node.cloneNode())
		this.circle3 = new SVGObject(node.cloneNode())
		this.add(this.circle1)
		this.add(this.circle2)
		this.add(this.circle3)
		this.circle1.position.y = 20
		this.circle2.position.y = 30

		const node2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		node2.textContent = ("123")
		setInterval(() => {
			node2.textContent += "!"
		}, 1000)
		node2.style.textAnchor = 'middle'
		this.circle4 = new SVGObject(node2)
		this.add(this.circle4)
	}
}

<div class="itemview-dark"
	style="max-height: 800px; padding: 0px; height: fit-content; flex-shrink: 0; user-select: auto; border: var(--ObjectBGColor) 6px solid;">
	<div style="width: 100%; height: 100%; border-radius: var(--ObjectRadius); overflow: auto;">
		<table style="width: 100%;">
			<tr>
				<th>名称</th>
				<th>官网</th>
				<th>性质</th>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
			<tr>
				<td>C语言中文网</td>
				<td>http://c.biancheng.net/</td>
				<td>教育</td>
			</tr>
			<tr>
				<td>百度</td>
				<td>http://www.baidu.com/</td>
				<td>搜索</td>
			</tr>
			<tr>
				<td>当当</td>
				<td>http://www.dangdang.com/</td>
				<td>图书</td>
			</tr>
		</table>
	</div>

</div>

table {
	/* border: 2px solid red; */
	border - spacing: 0px;
	position: relative;
}

table > tr: first - child {
	background - color: var(--ObjectBGColor);
	position: sticky;
	top: 0;
}

td {
	text - align: center;
	background - color: transparent;
	border: 0px;
	padding: 8px 8px;
	border: var(--ScrollColor) solid;
	border - width: 0px 1px 0px 0px;
	background - color: var(--ObjectColor);
	font - size: 14px;
}

th {
	text - align: center;
	background - color: transparent;
	border: 0px;
	padding: 8px 8px;
	border: var(--ObjectColor) solid;
	border - width: 0px 1px 0px 0px;
	font - size: 14px;
	font - weight: normal;
}

table > tr: nth - child(odd) > td {
	background - color: var(--ScrollColor);
	border: var(--ObjectColor) solid;
	border - width: 0px 1px 0px 0px;
}

tr > td: last - child,
	tr > th: last - child {
	border - right: 0px!important;

}

table > tr: last - child > td,
	table > tr: last - child > th {
	border - bottom: 0px;
}