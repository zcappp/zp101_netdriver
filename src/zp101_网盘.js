import React from "react"
import css from "./zp101_网盘.css"

function render(ref) {
    const { type, tab } = ref
    if (!ref.auth) return <div>需要登录</div>
    return <React.Fragment>
        <a onClick={() => open(ref)} className="zp101A">{EL[type]}{EL[type]}<label>{ref.props.label || "网盘"}</label></a>
        {!!ref.open && <div className="zmodals">
            <div className="zmask" onClick={() => close(ref)}/>
            <div className="zmodal">
                {rX("zsvg_x", () => close(ref))}
                <div className="hd">
                    <ul className="znone">
                        <li onClick={() => {ref.tab = type; ref.render()}} className={"ztab" + (tab === type ? " cur" : "")}>{LABEL[type]}</li>
                        <li onClick={() => {ref.tab = "收藏"; ref.render()}} className={"ztab" + (tab === "收藏" ? " cur" : "")}>收藏</li>
                    </ul>
                </div>
                <div className="bd">
                    {rList(ref)}
                    <div className="交叉观察器"/>
                </div>
                <div className="ft"/>
            </div>
        </div>}
    </React.Fragment>
}

function rList(ref) {
    const { type } = ref
    const arr = ref.tab === "收藏" ? ref.favorites : ref.all
    if (type === "i") {
        return arr.map((o, i) =>
            <a className="zp101B" onClick={() => onSelect(ref, o)} key={i}>
            <img src={o.url.endsWith("svg") || o.url.endsWith("ico") || o.url.endsWith("webm") ? o.url : o.url + "?x-oss-process=image/resize,m_fill,h_300,w_300"} title={o.name}/>
            {ref.auth === o.auth && rX("zp101del", e => del(e, o._id, ref))}{rFavorite(ref, o)}
        </a>)
    }
    if (type === "v") {
        return arr.map((o, i) =>
            <a className="zp101B" onClick={() => onSelect(ref, o)} key={i}>
            {!o.url.endsWith("mp4") ? <video src={o.url}/> : <img src={o.url + "?x-oss-process=video/snapshot,m_fast,t_5000,w_0,ar_auto"} title={o.name}/>}
            {ref.auth === o.auth && rX("zp101del", e => del(e, o._id, ref))}{rFavorite(ref, o)}
            <i className="zplaybtn"/>
        </a>)
    }
    if (type === "f") {
        return <div className="zcells">
            {arr.map((o, i) => <a className="zcell" onClick={() => onSelect(ref, o)} key={i}>
                <div>{o.name}</div>
                {rFavorite(ref, o)}{ref.auth === o.auth && rX("zp101del", e => del(e, o._id, ref))}
            </a>)}
        </div>
    }
}

function rX(cx, onClick) {
    return <svg onClick={onClick} className={"zsvg " + cx} viewBox="64 64 896 896"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"/></svg>
}

function rFavorite(ref, o) {
    return <svg onClick={e => favorite(e, o, ref)} className={"zsvg " + (ref.favorites.find(a => a._id === o._id) ? "zp101stared" : "zp101star")} viewBox="64 64 896 896"><path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"/></svg>
}

function init(ref) {
    const type = ref.type = ref.props.type || "i"
    ref.auth = ref.excA("$c.me._id")
    ref.O = { select: "type name format auth", sort: { _id: -1 }, limit: 20, skip: 0 }
    ref.Q = { type, status: { $exists: false } }
    if (ref.props.mineOnly) ref.Q.auth = ref.auth
    ref.favorites = ref.excA(`localStorage("zp101_${type}")`)
    if (!Array.isArray(ref.favorites)) ref.favorites = []
    ref.tab = ref.favorites.length ? "收藏" : type
    ref.io = new IntersectionObserver((entries, observer) => entries.forEach(x => {
        if (!x.isIntersecting || ref.tab === "收藏") return
        if (ref.excA('$c.x.zp101.count') < ref.O.skip + 20) return ref.io.disconnect()
        ref.O.skip = ref.O.skip + 20
        ref.exc('$resource.search("zp101", ref.Q, ref.O)', { ref }, () => ref.render())
    }))
}

function open(ref) {
    ref.exc('$resource.search("zp101", ref.Q, ref.O)', { ref }, $r => {
        ref.open = true
        ref.all = ref.excA("$c.x.zp101.all") || []
        ref.render()
        setTimeout(() => ref.io.observe($("#" + ref.id + " .交叉观察器")), 9)
    })
}

function close(ref) {
    ref.io.unobserve($("#" + ref.id + " .交叉观察器"))
    ref.open = false
    ref.render()
}

function onSelect(ref, o) {
    const on = ref.props.onSelect
    typeof on === "function" ? on(o) : ref.exc(on, { $ext: ref.ctx, ...o }, () => ref.exc("render()"))
    close(ref)
}

function favorite(e, o, ref) {
    e.stopPropagation()
    const { exc, favorites } = ref
    if (favorites.find(a => a._id === o._id)) {
        favorites.splice(favorites.findIndex(a => a._id === o._id), 1)
    } else {
        favorites.push(o)
    }
    exc(`localStorage("zp101_${ref.type}", favorites)`, { favorites })
    ref.render()
}

function del(e, id, ref) {
    e.stopPropagation()
    const { exc, favorites } = ref
    exc('confirm("注意, 即将彻底删除此" + type, "请确保此" + type + "已不在任何地方使用"); $resource.delete(id)', { id, type: LABEL[ref.type] }, r => {
        if (!r._id) return exc('warn("删除失败")')
        ref.all.splice(ref.all.findIndex(a => a._id === id), 1)
        if (favorites.find(a => a._id === id)) {
            favorites.splice(favorites.findIndex(a => a._id === id), 1)
            exc(`localStorage("zp101_${ref.type}", arr)`, { arr: favorites.map(o => id) })
        }
        ref.render()
    })
}

function destroy({ io }) {
    io && io.disconnect()
}

$plugin({
    id: "zp101",
    props: [{
        prop: "type",
        type: "radio",
        items: [
            ["i", "v", "f"],
            ["图片", "视频", "文件"]
        ],
        label: "资源类型"
    }, {
        prop: "mineOnly",
        type: "switch",
        label: "只允许查看自己上传的"
    }, {
        prop: "onSelect",
        type: "exp",
        label: "onSelect表达式",
        ph: "选择一个资源后执行 { url, name, size }"
    }, {
        prop: "label",
        type: "text",
        label: "【网盘】文本"
    }],
    render,
    init,
    destroy,
    css
})

const LABEL = { i: "图片", v: "视频", f: "文件" }
const EL = {
    i: <svg className="zsvg" viewBox="0 0 1024 1024"><path d="M896 1024H128a128 128 0 0 1-128-128V128a128 128 0 0 1 128-128h768a128 128 0 0 1 128 128v768a128 128 0 0 1-128 128z m0-64a64 64 0 0 0 64-64v-256.032l-192-192-273.184 273.152L730.624 960H896zM64 896a64 64 0 0 0 64 64h512.032L318.24 638.208 64 865.952V896zM960 128a64 64 0 0 0-64-64H128a64 64 0 0 0-64 64v650.752L320 544l129.856 131.552L768 352l192 196.096V128zM256 384a128 128 0 1 1 0-256 128 128 0 0 1 0 256z m0-192a64 64 0 1 0 0.032 128.032A64 64 0 0 0 256 192z"/></svg>,
    v: <svg className="zsvg" viewBox="64 64 896 896"><path d="M912 302.3L784 376V224c0-35.3-28.7-64-64-64H128c-35.3 0-64 28.7-64 64v576c0 35.3 28.7 64 64 64h592c35.3 0 64-28.7 64-64V648l128 73.7c21.3 12.3 48-3.1 48-27.6V330c0-24.6-26.7-40-48-27.7zM712 792H136V232h576v560zm176-167l-104-59.8V458.9L888 399v226zM208 360h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H208c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"/></svg>,
    f: <svg className="zsvg" viewBox="0 0 1024 1024"><path d="M870.4 358.4h-204.8a102.4 102.4 0 0 1-102.4-102.4V51.2H204.8a51.2 51.2 0 0 0-51.2 51.2v819.2a51.2 51.2 0 0 0 51.2 51.2h614.4a51.2 51.2 0 0 0 51.2-51.2V358.4z m-21.1968-51.2L614.4 72.3968V256a51.2 51.2 0 0 0 51.2 51.2h183.6032z m-277.1968-307.2a102.4 102.4 0 0 1 72.3968 30.0032l247.1936 247.1936A102.4 102.4 0 0 1 921.6 349.5936V921.6a102.4 102.4 0 0 1-102.4 102.4H204.8a102.4 102.4 0 0 1-102.4-102.4V102.4a102.4 102.4 0 0 1 102.4-102.4h367.2064z"/></svg>
}