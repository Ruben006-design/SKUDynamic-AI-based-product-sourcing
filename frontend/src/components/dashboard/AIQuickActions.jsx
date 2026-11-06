import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Box,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import { useNavigate } from "react-router-dom";

function AIQuickActions() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: "secondary.main",
              }}
            >
              <PsychologyRoundedIcon fontSize="small" />
            </Box>
            <div>
              <Typography variant="subtitle1" fontWeight={700}>
                AI Intelligence Actions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Launch automated reorder pipelines and weight analyses
              </Typography>
            </div>
          </Stack>

          <Chip
            label="Offline Engine Ready"
            color="success"
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontWeight: 600,
              borderRadius: 1.5,
            }}
          />
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        <Stack spacing={2}>
          {/* Action 1 */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <div>
              <Typography variant="body2" fontWeight={600}>
                Generate AI Reordering Recommendation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Calculate inventory position, target stock, and supplier selection for target SKU.
              </Typography>
            </div>

            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => navigate("/ai-recommendations")}
              sx={{ minWidth: 140, py: 0.8 }}
            >
              Launch Engine
            </Button>
          </Stack>

          <Divider />

          {/* Action 2 */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <div>
              <Typography variant="body2" fontWeight={600}>
                Analyze 8-Factor Weight Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inspect local statistical weights across sales velocity, lead time, and popularity.
              </Typography>
            </div>

            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneRoundedIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => navigate("/weightages")}
              sx={{ minWidth: 140, py: 0.8 }}
            >
              View Weights
            </Button>
          </Stack>

          <Divider />

          {/* Action 3 */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <div>
              <Typography variant="body2" fontWeight={600}>
                Audit Procurement Reports
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Export order logs, evaluate approval rates, and review supply distribution.
              </Typography>
            </div>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AssessmentRoundedIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => navigate("/reports")}
              sx={{ minWidth: 140, py: 0.8 }}
            >
              Reports
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AIQuickActions;
