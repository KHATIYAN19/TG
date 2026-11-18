import { useMemo, useState } from "react";
import { Binary, Stack } from "@phosphor-icons/react";

import { Section } from "./bookKit";
import CsBookPage from "./csBook/CsBookPage";
import { CN_BOOK, OSI_LAYERS, TCP_UDP } from "./csBook/cnData";

/*
  /book/computer-network: Computer Networks, The Placement Handbook.
  Shared CS-book frame (CsBookPage) + two hands-on labs that only this book has:
    1. OSI explorer: pick a layer, see its job, PDU, address, protocols, and the headers stacked so far.
    2. Subnet calculator: type any IPv4/CIDR, get mask, network, broadcast, hosts, the binary split and the subnets.
*/

/* ------------------------------------------------------------------ OSI explorer */
function OsiExplorer() {
  const [n, setN] = useState(4);
  const layer = OSI_LAYERS.find((l) => l.n === n);
  /* headers added from the application down to the chosen layer (layers 5 and 1 add none) */
  const headers = OSI_LAYERS.filter((l) => l.n >= n && l.hdr).map((l) => l);
  const lower = headers.filter((h) => h.n <= 4).sort((a, b) => a.n - b.n); // ETH, IP, TCP from left to right
  const upper = headers.filter((h) => h.n > 4).sort((a, b) => a.n - b.n);  // TLS, HTTP

  return (
    <div className="cs-lab">
      <div className="cs-card">
        <p className="cs-card-k"><Stack size={16} weight="bold" aria-hidden />Pick a layer</p>
        <div className="cn-stack" role="group" aria-label="OSI layers">
          {OSI_LAYERS.map((l) => (
            <button key={l.n} type="button" className="cn-layer" aria-pressed={l.n === n} onClick={() => setN(l.n)}>
              <span className="hb-mono">L{l.n}</span><b>{l.name}</b><small>{l.pdu}</small>
            </button>
          ))}
        </div>
        <p className="cn-mapping">TCP/IP model: layers 7–5 are one <b>Application</b> layer, 2–1 are <b>Network Access</b>.</p>
      </div>

      <div className="cs-card" aria-live="polite">
        <p className="cs-card-k">Layer {layer.n} · {layer.name}</p>
        <h3 className="hb-h3">{layer.job}</h3>
        <dl className="cs-kv">
          <div><dt>PDU</dt><dd>{layer.pdu}</dd></div>
          <div><dt>Address</dt><dd>{layer.address}</dd></div>
          <div><dt>TCP/IP layer</dt><dd>{layer.tcpip}</dd></div>
          <div><dt>Devices</dt><dd>{layer.devices}</dd></div>
        </dl>
        <ul className="cn-proto" aria-label="Protocols">{layer.protocols.map((p) => <li key={p}>{p}</li>)}</ul>

        <div>
          <p className="cs-card-k" style={{ marginBottom: 8 }}>What is on the wire at this layer</p>
          {layer.n === 1 ? (
            <p className="cn-bits" aria-label="The frame as raw bits">0100 0101 0000 0000 0000 0101 1101 1100 1010 1000 …</p>
          ) : (
            <div className="cn-pdu" key={n}>
              {lower.map((h) => <span key={h.n} className={h.cls}>{h.hdr}</span>)}
              {upper.map((h) => <span key={h.n} className={h.cls}>{h.hdr}</span>)}
              <span className="h-data">data</span>
              {n <= 2 && <span className="h-l2">FCS</span>}
            </div>
          )}
        </div>

        <div className="cn-q"><b>Interview: {layer.q}</b><p>{layer.a}</p></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ subnet calculator */
const toInt = (ip) => ip.split(".").reduce((n, o) => ((n << 8) + Number(o)) >>> 0, 0);
const toIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
const maskOf = (p) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);

function parse(text) {
  const m = text.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*(?:\/\s*(\d{1,2}))?$/);
  if (!m) return { error: "Use the form 192.168.10.0/24" };
  const octets = m[1].split(".").map(Number);
  if (octets.some((o) => o > 255)) return { error: "Each part of the address must be 0 to 255." };
  const prefix = m[2] === undefined ? 24 : Number(m[2]);
  if (prefix > 32) return { error: "The prefix must be between /0 and /32." };
  return { ip: toInt(m[1]), prefix };
}

function classOf(ip) {
  const a = ip >>> 24;
  if (a === 127) return "Loopback";
  if (a < 128) return "A"; if (a < 192) return "B"; if (a < 224) return "C"; if (a < 240) return "D (multicast)"; return "E (reserved)";
}
function isPrivate(ip) {
  const a = ip >>> 24; const b = (ip >>> 16) & 255;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function SubnetLab() {
  const [text, setText] = useState("192.168.10.77/26");
  const [split, setSplit] = useState(null);
  const res = useMemo(() => parse(text), [text]);
  const ok = !res.error;

  const calc = useMemo(() => {
    if (!ok) return null;
    const { ip, prefix } = res;
    const mask = maskOf(prefix);
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const size = 2 ** (32 - prefix);
    const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : size - 2;
    const first = prefix >= 31 ? network : network + 1;
    const last = prefix >= 31 ? broadcast : broadcast - 1;
    return { ip, prefix, mask, network, broadcast, usable, first, last, wildcard: ~mask >>> 0 };
  }, [ok, res]);

  const newPrefix = calc ? Math.min(Math.max(split ?? calc.prefix + 2, calc.prefix + 1), 32) : 0;
  const subnets = useMemo(() => {
    if (!calc || calc.prefix >= 32) return null;
    const count = 2 ** (newPrefix - calc.prefix);
    const step = 2 ** (32 - newPrefix);
    const list = Array.from({ length: Math.min(count, 16) }, (_, i) => {
      const net = (calc.network + i * step) >>> 0;
      const bc = (net + step - 1) >>> 0;
      return { net, bc, hosts: newPrefix >= 31 ? (newPrefix === 32 ? 1 : 2) : step - 2 };
    });
    return { count, list };
  }, [calc, newPrefix]);

  const bits = calc ? [24, 16, 8, 0].map((s) => ((calc.ip >>> s) & 255).toString(2).padStart(8, "0")).join("") : "";
  const maskBits = calc ? "1".repeat(calc.prefix) + "0".repeat(32 - calc.prefix) : "";
  const octetBits = (str) => [0, 8, 16, 24].map((i) => (
    <i key={i}>{str.slice(i, i + 8).split("").map((b, j) => <span key={j} className={i + j < calc.prefix ? "n" : "h"}>{b}</span>)}{i < 24 && "."}</i>
  ));

  return (
    <div className="cs-lab">
      <div className="cs-card">
        <p className="cs-card-k"><Binary size={16} weight="bold" aria-hidden />Subnet calculator</p>
        <label htmlFor="cn-ip" className="hb-sr">IPv4 address with prefix</label>
        <input id="cn-ip" className={`cs-input${ok ? "" : " is-bad"}`} value={text} onChange={(e) => { setText(e.target.value); setSplit(null); }} inputMode="decimal" autoComplete="off" spellCheck="false" aria-invalid={!ok} aria-describedby="cn-ip-help" />
        {ok ? <p id="cn-ip-help" className="cs-hint">Try 10.0.0.0/8, 172.16.5.4/20 or 192.168.1.130/27.</p> : <p id="cn-ip-help" className="cs-err" role="alert">{res.error}</p>}
        {calc && (
          <div className="cn-binary" aria-label="Address and mask in binary">
            <div className="cn-binary-row"><span>Address</span>{octetBits(bits)}</div>
            <div className="cn-binary-row"><span>Mask</span>{octetBits(maskBits)}</div>
            <p className="cs-hint"><b style={{ color: "var(--brand)" }}>{calc.prefix} network bits</b> · {32 - calc.prefix} host bits</p>
          </div>
        )}
      </div>

      {calc && (
        <div className="cs-card" aria-live="polite">
          <dl className="cs-kv">
            <div className="is-brand"><dt>Network</dt><dd>{toIp(calc.network)}/{calc.prefix}</dd></div>
            <div><dt>Broadcast</dt><dd>{calc.prefix >= 31 ? "none" : toIp(calc.broadcast)}</dd></div>
            <div><dt>Subnet mask</dt><dd>{toIp(calc.mask)}</dd></div>
            <div><dt>Wildcard</dt><dd>{toIp(calc.wildcard)}</dd></div>
            <div className="is-wide"><dt>Usable hosts</dt><dd>{toIp(calc.first)} – {toIp(calc.last)}</dd></div>
            <div className="is-brand"><dt>Host count</dt><dd>{calc.usable.toLocaleString("en-IN")}</dd></div>
            <div><dt>Class · scope</dt><dd>{classOf(calc.ip)} · {isPrivate(calc.ip) ? "private" : "public"}</dd></div>
          </dl>
          {subnets && (
            <div className="cn-split">
              <div className="cn-split-row">
                <label htmlFor="cn-split">Split into</label>
                <select id="cn-split" value={newPrefix} onChange={(e) => setSplit(Number(e.target.value))}>
                  {Array.from({ length: Math.min(32, calc.prefix + 8) - calc.prefix }, (_, i) => calc.prefix + 1 + i).map((p) => <option key={p} value={p}>/{p}</option>)}
                </select>
                <span><b>{subnets.count.toLocaleString("en-IN")}</b> subnets of {subnets.list[0].hosts.toLocaleString("en-IN")} hosts</span>
              </div>
              <ol className="cn-subs">
                {subnets.list.map((s, i) => (
                  <li key={s.net}><span>{i + 1}</span><b>{toIp(s.net)}/{newPrefix}</b><small>{toIp(s.net)} – {toIp(s.bc)}</small></li>
                ))}
                {subnets.count > 16 && <li className="more">… and {(subnets.count - 16).toLocaleString("en-IN")} more</li>}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComputerNetworkBook() {
  return (
    <CsBookPage book={CN_BOOK}>
      <Section id="try" eyebrow="Try it free" title="Two tools from the book, working right here" lead="Click through the OSI stack to see what each layer adds, then subnet any network the way Chapter 5 teaches it." tint>
        <div className="cs-labs">
          <OsiExplorer />
          <SubnetLab />
          <div className="hb-cmp cs-stack" role="region" aria-label="TCP compared with UDP" tabIndex={0}>
            <table>
              <thead><tr><th scope="col"><span className="hb-sr">Feature</span></th><th scope="col" className="is-mine">TCP</th><th scope="col">UDP</th></tr></thead>
              <tbody>{TCP_UDP.map(([k, t, u]) => <tr key={k}><th scope="row">{k}</th><td data-label="TCP">{t}</td><td data-label="UDP">{u}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </Section>
    </CsBookPage>
  );
}
