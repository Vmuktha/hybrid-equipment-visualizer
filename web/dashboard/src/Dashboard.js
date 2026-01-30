import React, { useEffect, useState } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import { motion } from "framer-motion";
import CssBaseline from "@mui/material/CssBaseline";
import BASE_URL from "./api";




import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Dashboard() {

  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [latest, setLatest] = useState(null);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);



  useEffect(() => {
    fetchHistory();
  }, []);

  const theme = createTheme({
  palette: {
    mode: dark ? "dark" : "light",
    primary: {
      main: "#1976d2"
    }
  }
});

  // ----------------------------
  // Fetch History
  // ----------------------------
  const fetchHistory = async () => {

    try {

      const res = await axios.get(
        "${https://chem-analyzer-backend.onrender.com}/api/history/"
      );

      setHistory(res.data);

      if (res.data.length > 0) {
        setLatest(res.data[0]);

        if (res.data[0].rows) {
               setRows(res.data[0].rows);
        }
      }

    } catch (err) {
      console.log(err);
    }
  };

  // ----------------------------
  // Upload CSV
  // ----------------------------
  const uploadFile = async () => {

    if (!file) {
      alert("Select a file first");
      return;
    }

    try {

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(

        "/api/upload/",
        formData
      );

      if (res.data.rows) {
           setRows(res.data.rows);
      }


      fetchHistory();

    } catch {
      alert("Upload failed");
    }
  };

  // ----------------------------
  // Download PDF Report
  // ----------------------------
  const downloadReport = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "${https://chem-analyzer-backend.onrender.com}/api/report/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "report.pdf");

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (err) {
      alert("Failed to download report");
    }
  };

  // ----------------------------
  // Logout
  // ----------------------------
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box
    sx={{
    minHeight: "100vh",
    backgroundColor: dark
      ? "#121212"
      : "#f5f7fb",
    transition: "0.3s"
  }}>

      {/* Top Bar */}
      <AppBar position="static">

        <Toolbar>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chemical Equipment Parameter Visualizer
          </Typography>

          <Button
            color="inherit"
            onClick={downloadReport}
          >
            Download Report
          </Button>
          <Switch
              checked={dark}
              onChange={() => setDark(!dark)}
          />

          <Button
            color="inherit"
            onClick={logout}
          >
            Logout
          </Button>

        </Toolbar>

      </AppBar>

      {/* Main */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>


        {/* Upload */}
        <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
        <Paper
  sx={{
    p: 3,
    mb: 4,
    borderRadius: 3,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transition: "0.3s",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 12px 25px rgba(0,0,0,0.25)"
    }
  }}
>
{/* History */}
{history.length > 0 && (

  <Paper
    sx={{
      p: 3,
      mb: 4,
      borderRadius: 3
    }}
  >

    <Typography variant="h6" mb={2}>
      ✦ Recent Uploads
    </Typography>

    {history.map((h, i) => (

      <Box
        key={h.id}
        sx={{
          p: 1.5,
          mb: 1,
          borderRadius: 2,
          cursor: "pointer",
          background: dark ? "#1e1e1e" : "#f5f7fb",
          transition: "0.2s",
          "&:hover": {
            background: dark ? "#2a2a2a" : "#e3edff"
          }
        }}

        onClick={() => {
          setLatest(h);
          setRows(h.rows || []);
        }}
      >

        <Typography>
          📄 {h.name}
        </Typography>

        <Typography
          variant="caption"
          color="textSecondary"
        >
          {new Date(h.uploaded_at).toLocaleString()}
        </Typography>

      </Box>

    ))}

  </Paper>
)}


          <Typography variant="h6">
            Upload CSV
          </Typography>

          <Grid container spacing={2}>

            <Grid item>
              <input
                type="file"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
              />
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={uploadFile}
              >
                Upload
              </Button>
            </Grid>

          </Grid>

        </Paper>
        </motion.div>

        {/* Stats */}
        {latest && (
          <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
          <Grid container spacing={3} mb={4}>

            <Stat
              title="Total"
              value={latest.summary.total_records}
            />

            <Stat
              title="Flow"
              value={latest.summary.avg_flowrate.toFixed(2)}
            />

            <Stat
              title="Pressure"
              value={latest.summary.avg_pressure.toFixed(2)}
            />

            <Stat
              title="Temp"
              value={latest.summary.avg_temperature.toFixed(2)}
            />

          </Grid>
          </motion.div>
        )}
        {latest && (
  <Paper sx={{ p: 2, mb: 3, borderLeft: "5px solid #1976d2" }}>

    <Typography variant="subtitle1">
      💡 Insight:
      Most common equipment is{" "}
      <b>
        {
          Object.entries(latest.summary.type_distribution)
            .sort((a, b) => b[1] - a[1])[0][0]
        }
      </b>{" "}
      with{" "}
      {
        Object.entries(latest.summary.type_distribution)
          .sort((a, b) => b[1] - a[1])[0][1]
      }{" "}
      units.
    </Typography>

  </Paper>
)}


        {/* Chart */}
        {latest && (
          <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
          <Paper
  sx={{
    p: 3,
    mb: 4,
    borderRadius: 3,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transition: "0.3s",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 12px 25px rgba(0,0,0,0.25)"
    }
  }}
>


            <Typography variant="h6" mb={2}>
              Distribution
            </Typography>

            <Bar
              data={{
                labels: Object.keys(
                  latest.summary.type_distribution
                ),
                datasets: [
                  {
                    label: "Count",
                    data: Object.values(
                      latest.summary.type_distribution
                    ),
                    backgroundColor: "#1976d2"
                  }
                ]
              }}
            />

          </Paper>
          </motion.div>
        )}

        {/* Data Table */}
            {rows.length > 0 && (
              <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

          <Paper
  sx={{
    p: 3,
    mb: 4,
    borderRadius: 3,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transition: "0.3s",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 12px 25px rgba(0,0,0,0.25)"
    }
  }}
>


          <Typography variant="h6" mb={2}>
               Data Preview
          </Typography>

    <input
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        padding: "8px",
        width: "100%",
        marginBottom: "15px"
      }}
    />

    <Box
      sx={{
        maxHeight: 300,
        overflow: "auto",
        border: "1px solid #ddd"
      }}
    >

      <table width="100%" border="1" cellPadding="8">

        <thead style={{ background: dark ? "#333" : "#1976d2",
            color: "white",
            position: "sticky",
            top: 0,
            zIndex: 1 }}>

          <tr>
            <th>Equipment</th>
            <th>Type</th>
            <th>Flow</th>
            <th>Pressure</th>
            <th>Temp</th>
          </tr>

        </thead>

        <tbody>

          {rows
            .filter((r) =>
              JSON.stringify(r)
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((r, i) => (

              <tr key={i}>
                <td>{r["Equipment Name"]}</td>
                <td>{r["Type"]}</td>
                <td>{r["Flowrate"]}</td>
                <td>{r["Pressure"]}</td>
                <td>{r["Temperature"]}</td>
              </tr>

            ))}

        </tbody>

      </table>

    </Box>

  </Paper>
  </motion.div>
)}


      </Container>

    </Box>
    
</ThemeProvider>

  );
}

// ----------------------------
// Stat Card Component
// ----------------------------
function Stat({ title, value }) {

  return (
    <Grid item xs={12} md={3}>

      <Card>

        <CardContent>

          <Typography color="textSecondary">
            {title}
          </Typography>

          <Typography variant="h5">
            {value}
          </Typography>

        </CardContent>

      </Card>

    </Grid>
  );
}

export default Dashboard;
