import React,{useState} from 'react'

function Header() {
      const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    
   
  return (
    
      <div
          style={{
            marginLeft: isSidebarCollapsed ? "5%" : "1%",
            display: "flex",
            padding: "10px 0",
            gap: "15px",
          }}
        >
          <a
            href="#"
            style={{
              color: "#000",
              textDecoration: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Book Requests
          </a>
          <a
            href="#"
            style={{
              color: "#000",
              textDecoration: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Renew Requests
          </a>
          <a
            href="#"
            style={{
              color: "#000",
              textDecoration: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Member Info
          </a>
        </div>
    
  )
}

export default Header
