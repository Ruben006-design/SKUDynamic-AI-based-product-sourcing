import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Snackbar,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

import {
  generatePrompt,
  generateWeightage,
  generateBatchWeightage,
  generateRecommendation,
  generateBatchRecommendation,
} from "../../services/aiRecommendationService";

function AIRecommendationCenter({
  retailers = [],
  weightConfigs = [],
  products = [],
}) {
  const [retailer, setRetailer] = useState("");
const [config, setConfig] = useState("");
const [product, setProduct] = useState("");

const [loading, setLoading] = useState(false);

const [prompt, setPrompt] = useState("");

const [weightage, setWeightage] = useState(null);

const [recommendation, setRecommendation] = useState(null);

const [weightGenerated, setWeightGenerated] =
  useState(false);

const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "success",
});

const showMessage = (
  message,
  severity = "success"
) => {
  setSnackbar({
    open: true,
    message,
    severity,
  });
};

/* -----------------------------
   Generate Prompt
------------------------------ */

const handleGeneratePrompt = async () => {
  if (!retailer || !config || !product) {
    showMessage(
      "Please select retailer, configuration and product.",
      "warning"
    );
    return;
  }

  try {
    setLoading(true);

    const response = await generatePrompt({
      retailer_id: retailer,
      config_id: config,
      product_id: product,
    });

    setPrompt(
      response.prompt ??
        JSON.stringify(response, null, 2)
    );

    showMessage(
      "Prompt generated successfully."
    );
  } catch (error) {
    console.error(error);

    showMessage(
      "Prompt generation failed.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

/* -----------------------------
   Generate Weightage
------------------------------ */

const handleGenerateWeightage =
  async () => {
    if (!retailer || !config || !product) {
      showMessage(
        "Please select retailer, configuration and product.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await generateWeightage(
          product,
          {
            retailer_id: retailer,
            config_id: config,
          }
        );

      setWeightage(response);

      setWeightGenerated(true);

      showMessage(
        "Weightage generated successfully."
      );
    } catch (error) {
      console.error(error);

      showMessage(
        "Weightage generation failed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };


const handleGenerateRecommendation =
  async () => {
    if (!weightGenerated) {
      showMessage(
        "Generate Weightage first.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await generateRecommendation(
          product,
          {
            retailer_id: retailer,
            config_id: config,
          }
        );

      setRecommendation(response);

      showMessage(
        "Recommendation generated successfully."
      );
    } catch (error) {
      console.error(error);

      showMessage(
        "Recommendation generation failed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };


const handleGenerateBatch = async () => {
  if (!retailer || !config) {
    showMessage(
      "Please select retailer and configuration.",
      "warning"
    );
    return;
  }

  try {
    setLoading(true);

    await generateBatchRecommendation({
      retailer_id: retailer,
      config_id: config,
    });

    showMessage(
      "Batch recommendations generated successfully."
    );
  } catch (error) {
    console.error(error);

    showMessage(
      "Batch generation failed.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

console.log("Products:", products);
console.log("Retailers:", retailers);
console.log("Weight Configs:", weightConfigs);
  return (
  <>
    <Card
      sx={{
        mt: 3,
        borderRadius: 5,
        background:
          "linear-gradient(135deg,#111827,#1E293B)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          mb={4}
        >
          <PsychologyRoundedIcon
            sx={{
              fontSize: 45,
              color: "#6366F1",
            }}
          />

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
            >
              AI Recommendation Center
            </Typography>

            <Typography color="text.secondary">
              Generate intelligent reorder recommendations powered by
              Gemini AI.
            </Typography>
          </Box>

          <Chip
            label="Gemini AI"
            color="success"
            sx={{ ml: "auto" }}
          />
        </Stack>

        {/* Selection */}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Retailer"
              value={retailer}
              onChange={(e) =>
                setRetailer(e.target.value)
              }
            >
              {retailers.map((r) => (
                <MenuItem
                  key={r.retailer_id}
                  value={r.retailer_id}
                >
                  {r.retailer_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Weight Configuration"
              value={config}
              onChange={(e) =>
                setConfig(e.target.value)
              }
            >
              {weightConfigs.map((c) => (
                <MenuItem
                  key={c.config_id}
                  value={c.config_id}
                >
                  {c.config_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Product"
              value={product}
              onChange={(e) =>
                setProduct(e.target.value)
              }
            >
              {products.map((p) => (
                <MenuItem
                  key={p.product_id}
                  value={p.product_id}
                >
                  {p.product_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Buttons */}

        <Stack
          direction="row"
          spacing={2}
          mt={4}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            disabled={loading}
            onClick={handleGeneratePrompt}
          >
            Generate Prompt
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              <AutoAwesomeRoundedIcon />
            }
            onClick={
              handleGenerateWeightage
            }
          >
            Generate Weightage
          </Button>

          <Button
            variant="contained"
            color="success"
            disabled={
              loading || !weightGenerated
            }
            onClick={
              handleGenerateRecommendation
            }
          >
            Generate Recommendation
          </Button>

          <Button
            variant="outlined"
            disabled={loading}
            onClick={handleGenerateBatch}
          >
            Generate Batch
          </Button>
        </Stack>

        {loading && (
          <Stack
            mt={4}
            alignItems="center"
            spacing={2}
          >
            <CircularProgress />

            <Typography>
              AI is analysing inventory...
            </Typography>
          </Stack>
        )}

        {/* Prompt */}

        {prompt && (
          <Card
            sx={{
              mt: 4,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
              >
                Generated Prompt
              </Typography>

              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily:
                    "monospace",
                }}
              >
                {prompt}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Weightage */}

        {weightage && (
          <Card
            sx={{
              mt: 3,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
              >
                Generated Weightage
              </Typography>

              <pre>
                {JSON.stringify(
                  weightage,
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Recommendation */}

        {recommendation && (
          <Card
            sx={{
              mt: 3,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
              >
                AI Recommendation
              </Typography>

              <pre>
                {JSON.stringify(
                  recommendation,
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        )}

        <Alert
          severity="info"
          sx={{ mt: 4 }}
        >
          Workflow:
          <strong>
            {" "}
            Prompt → Weightage →
            Recommendation
          </strong>
        </Alert>
      </CardContent>
    </Card>

    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() =>
        setSnackbar({
          ...snackbar,
          open: false,
        })
      }
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        severity={snackbar.severity}
      >
        {snackbar.message}
      </MuiAlert>
    </Snackbar>
  </>
);
}

export default AIRecommendationCenter;