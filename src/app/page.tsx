"use client";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";

const clusterNames: Record<number, string> = {
  0: "Systems & Infrastructure",
  1: "Web & Frontend",
  2: "Education & Content",
  3: "AI & Machine Learning"
};

const colors: Record<number, string> = {
  0: "#2563EB", 1: "#DC2626", 2: "#059669", 3: "#D97706"
};

export default function Home() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [users, setUsers] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [topLanguages, setTopLanguages] = useState<string[]>([]);
  
  // D3 Selection Refs
  const nodeRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any



  const drawMap = useCallback((dataUsers: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const w = window.innerWidth;
    const h = window.innerHeight;
    const svg = d3.select(svgRef.current)
      .attr("width", w).attr("height", h);
      
    svg.selectAll("*").remove();

    const clusterCenters: Record<number,[number,number]> = {
      0: [w*0.28, h*0.35],
      1: [w*0.72, h*0.35],
      2: [w*0.28, h*0.70],
      3: [w*0.72, h*0.70],
    };

    const nodes = dataUsers.map(u => ({
      ...u,
      x: clusterCenters[u.cluster] ? clusterCenters[u.cluster][0] + (Math.random()-0.5)*220 : w/2,
      y: clusterCenters[u.cluster] ? clusterCenters[u.cluster][1] + (Math.random()-0.5)*220 : h/2,
    }));

    svg.append("rect").attr("width",w).attr("height",h).attr("fill","#0A1628");

    Object.entries(clusterCenters).forEach(([id, [cx,cy]]) => {
      svg.append("circle")
        .attr("cx",cx).attr("cy",cy).attr("r",180)
        .attr("fill", colors[Number(id)])
        .attr("opacity",0.08);
      svg.append("text")
        .attr("x",cx).attr("y",cy-195)
        .attr("text-anchor","middle")
        .attr("fill", colors[Number(id)])
        .attr("font-size","13px")
        .attr("font-family","sans-serif")
        .attr("font-weight","600")
        .attr("letter-spacing","1px")
        .text(clusterNames[Number(id)].toUpperCase());
    });

    const node = svg.selectAll("circle.node")
      .data(nodes).enter()
      .append("circle")
      .attr("class","node")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => Math.min(3 + Math.sqrt(d.total_stars||0)*0.08, 22))
      .attr("fill", d => colors[d.cluster] || "#999")
      .attr("opacity", 0.85)
      .attr("cursor","pointer")
      .on("mouseover", (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        d3.select(e.currentTarget).attr("stroke", "#fff").attr("stroke-width", 2);
      })
      .on("mouseout", (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        d3.select(e.currentTarget).attr("stroke", "none");
      })
      .on("click", (e, d) => {
        window.location.href = `/city?user=${d.id}`;
      });

    nodeRef.current = node;

    // labels
    const topPerCluster: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [] }; // eslint-disable-line @typescript-eslint/no-explicit-any
    nodes.forEach((n: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if(topPerCluster[n.cluster]) topPerCluster[n.cluster].push(n);
    });
    Object.values(topPerCluster).forEach(arr => {
      arr.sort((a,b)=>(b.total_stars||0)-(a.total_stars||0));
      arr.slice(0,5).forEach(n => {
        svg.append("text")
          .attr("x", n.x+5).attr("y", n.y-8)
          .attr("fill","#E2E8F0")
          .attr("font-size","11px")
          .attr("font-family","sans-serif")
          .attr("pointer-events","none")
          .text(n.id);
      });
    });
  }, []);

  useEffect(() => {
    fetch("/atlas_data.json").then(r => r.json()).then(data => {
      const parsedUsers = Object.entries(data).map(([name, info]: [string, any]) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: name, ...info
      }));
      setUsers(parsedUsers);
      
      // Calculate top 8 languages
      const langCounts: Record<string, number> = {};
      parsedUsers.forEach(u => {
        (u.languages || []).forEach((l: string) => {
          langCounts[l] = (langCounts[l] || 0) + 1;
        });
      });
      const topLangs = Object.entries(langCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 8)
        .map(x => x[0]);
      setTopLanguages(topLangs);
      
      drawMap(parsedUsers);
    });
  }, [drawMap]);
  
  // Apply filter whenever search or activeFilter changes
  const searchTerm = search.toLowerCase();
  const filterTerm = activeFilter.toLowerCase();
  
  const matchedUsers = useMemo(() => {
    if (!searchTerm && !filterTerm) return users;
    return users.filter(u => {
      const inSearch = searchTerm ? (
        u.id.toLowerCase().includes(searchTerm) ||
        (u.languages || []).some((l:string) => l.toLowerCase().includes(searchTerm)) ||
        (u.topics || []).some((t:string) => t.toLowerCase().includes(searchTerm))
      ) : true;
      
      const inFilter = filterTerm ? (
        (u.languages || []).some((l:string) => l.toLowerCase() === filterTerm)
      ) : true;
      
      return inSearch && inFilter;
    });
  }, [users, searchTerm, filterTerm]);

  useEffect(() => {
    if (!nodeRef.current) return;
    
    if (!searchTerm && !filterTerm) {
      nodeRef.current.attr("opacity", 0.85);
    } else {
      const matchedIds = new Set(matchedUsers.map(u => u.id));
      nodeRef.current.attr("opacity", (d: any) => matchedIds.has(d.id) ? 0.95 : 0.1); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }, [matchedUsers, searchTerm, filterTerm]);

  return (
    <div style={{background:"#0A1628",minHeight:"100vh",position:"relative",fontFamily:"sans-serif"}}>
      {/* Top Search Bar */}
      <div style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
        <div style={{display:"flex",gap:8}}>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="buscar tecnologia, linguagem..."
            style={{background:"#111D2E",border:"1px solid #1E3A5C",color:"#fff",padding:"8px 16px",borderRadius:8,fontSize:14,width:280,outline:"none"}}
          />
          <button
            onClick={() => { setSearch(""); setActiveFilter(""); }}
            style={{background:"#2563EB",color:"#fff",border:"none",padding:"8px 20px",borderRadius:8,fontSize:14,cursor:"pointer"}}
          >
            limpar
          </button>
        </div>
        {(search || activeFilter) && (
          <div style={{color:"#93C5FD",fontSize:13,background:"#1E3A5C",padding:"4px 12px",borderRadius:16}}>
            {matchedUsers.length} devs encontrados neste ecossistema
          </div>
        )}
      </div>

      {/* Header Logo */}
      <div style={{position:"absolute",top:20,left:24,zIndex:10}}>
        <div style={{color:"#fff",fontSize:22,fontWeight:700,letterSpacing:"-0.5px"}}>atlas <span style={{color:"#2563EB"}}>city</span></div>
        <div style={{color:"#94A3B8",fontSize:13,marginTop:6,fontWeight:500,lineHeight:1.4}}>
          Explore ecossistemas técnicos do GitHub.<br/>
          Descubra quem constrói cada tecnologia.
        </div>
        <div style={{color:"#2563EB",fontSize:12,marginTop:8,fontWeight:600}}>
          500 desenvolvedores · 4 ecossistemas
        </div>
      </div>
      
      {/* Side Filter */}
      <div style={{position:"absolute",top:130,left:24,zIndex:10,display:"flex",flexDirection:"column",gap:6}}>
        <div style={{color:"#64748B",fontSize:11,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"1px"}}>Top Linguagens</div>
        <button 
          onClick={() => setActiveFilter("")}
          style={{background: activeFilter===""?"#2563EB":"#111D2E",color:activeFilter===""?"#fff":"#94A3B8",border:"1px solid #1E3A5C",padding:"6px 12px",borderRadius:6,fontSize:12,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}
        >
          Todas
        </button>
        {topLanguages.map(lang => (
          <button
            key={lang}
            onClick={() => setActiveFilter(lang)}
            style={{background: activeFilter===lang?"#2563EB":"#111D2E",color:activeFilter===lang?"#fff":"#94A3B8",border:"1px solid #1E3A5C",padding:"6px 12px",borderRadius:6,fontSize:12,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} style={{display:"block",width:"100vw",height:"100vh"}} />

      {/* Legend */}
      <div style={{position:"absolute",bottom:24,left:24,zIndex:10,display:"flex",flexDirection:"column",gap:8,background:"#0F1F36",border:"1px solid #1E3A5C",padding:"16px",borderRadius:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#E2E8F0"}}><span style={{width:12,height:12,borderRadius:"50%",background:"#2563EB",display:"inline-block"}}></span> Systems & Infrastructure</div>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#E2E8F0"}}><span style={{width:12,height:12,borderRadius:"50%",background:"#DC2626",display:"inline-block"}}></span> Web & Frontend</div>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#E2E8F0"}}><span style={{width:12,height:12,borderRadius:"50%",background:"#059669",display:"inline-block"}}></span> Education & Content</div>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#E2E8F0"}}><span style={{width:12,height:12,borderRadius:"50%",background:"#D97706",display:"inline-block"}}></span> AI & Machine Learning</div>
      </div>

      {/* User Card Popup */}
      {selected && (
        <div style={{position:"absolute",bottom:32,right:32,background:"#0F1F36",border:"1px solid #1E3A5C",borderRadius:12,padding:"24px",minWidth:320,maxWidth:360,zIndex:20,boxShadow:"0 10px 25px -5px rgba(0, 0, 0, 0.5)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{color:"#fff",fontWeight:700,fontSize:18}}>@{selected.id}</div>
              <div style={{color:colors[selected.cluster]||"#2563EB",fontSize:13,fontWeight:600,marginTop:4}}>
                {clusterNames[selected.cluster]}
              </div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:22,lineHeight:1,padding:0,marginTop:"-4px"}}>×</button>
          </div>
          
          <div style={{display:"flex",gap:24,marginBottom:20,background:"#111D2E",padding:"12px",borderRadius:8}}>
            <div>
              <div style={{color:"#fff",fontWeight:700,fontSize:16}}>{(selected.total_stars||0).toLocaleString()}</div>
              <div style={{color:"#64748B",fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px",marginTop:2}}>stars</div>
            </div>
            <div>
              <div style={{color:"#fff",fontWeight:700,fontSize:16}}>{(selected.languages||[]).length}</div>
              <div style={{color:"#64748B",fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px",marginTop:2}}>linguagens</div>
            </div>
          </div>
          
          <div style={{marginBottom:20}}>
            <div style={{color:"#64748B",fontSize:11,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"1px"}}>Top Scripts/Repos</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(selected.top_5_repos||[]).slice(0,3).map((repo: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <div key={repo.name} style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                  <span style={{color:"#E2E8F0",textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap",maxWidth:"200px"}} title={repo.name}>{repo.name}</span>
                  <span style={{color:"#94A3B8",minWidth:"40px",textAlign:"right"}}>★ {repo.stars.toLocaleString()}</span>
                </div>
              ))}
            </div>
            {(selected.top_5_repos||[]).length === 0 && (
              <div style={{color:"#94A3B8",fontSize:13}}>Nenhum repositório encontrado</div>
            )}
          </div>
          
          <button
            onClick={()=>window.open(`https://github.com/${selected.id}`,"_blank")}
            style={{background:"#2563EB",color:"#fff",border:"none",padding:"10px 16px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",width:"100%",display:"flex",justifyContent:"center",alignItems:"center",gap:8}}
          >
            ver repositórios
          </button>
        </div>
      )}
    </div>
  );
}
