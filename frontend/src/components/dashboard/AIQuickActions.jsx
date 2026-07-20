import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import { useNavigate } from "react-router-dom";

function AIQuickActions() {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        mt: 3,
        borderRadius: 5,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <PsychologyRoundedIcon
              sx={{
                fontSize: 42,
                color: "primary.main",
              }}
            />

            <div>
              <Typography variant="h5" fontWeight={700}>
                AI Quick Actions
              </Typography>

              <Typography color="text.secondary">
                Launch AI features directly from the dashboard.
              </Typography>
            </div>
          </Stack>

          <Chip
            label="Gemini AI Connected"
            color="success"
          />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>
              <Typography fontWeight={600}>
                Generate Recommendation
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Create an AI recommendation for one product.
              </Typography>
            </div>

            <Button
              variant="contained"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={() =>
                navigate("/ai-recommendations")
              }
            >
              Generate
            </Button>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>
              <Typography fontWeight={600}>
                Generate Batch
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Generate recommendations for all products.
              </Typography>
            </div>

            <Button
              variant="outlined"
              startIcon={<LayersRoundedIcon />}
              onClick={() =>
                navigate("/ai-recommendations")
              }
            >
              Batch
            </Button>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>
              <Typography fontWeight={600}>
                AI Workspace
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Open the complete recommendation workspace.
              </Typography>
            </div>

            <Button
              color="secondary"
              startIcon={<OpenInNewRoundedIcon />}
              onClick={() =>
                navigate("/ai-recommendations")
              }
            >
              Open
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AIQuickActions;