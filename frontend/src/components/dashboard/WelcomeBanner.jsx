import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

function WelcomeBanner() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 5,
        p: { xs: 3, md: 5 },
        minHeight: 260,
        background:
          "linear-gradient(135deg,#0F172A 0%,#111827 40%,#1E3A8A 100%)",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 25px 60px rgba(0,0,0,.45)",

        "&::before": {
          content: '""',
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          top: -180,
          right: -140,
          background: "rgba(59,130,246,.18)",
          filter: "blur(90px)",
        },

        "&::after": {
          content: '""',
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          bottom: -140,
          left: -120,
          background: "rgba(139,92,246,.18)",
          filter: "blur(90px)",
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Chip
          icon={<CheckCircleRoundedIcon />}
          label="Gemini AI Connected"
          color="success"
          sx={{
            width: "fit-content",
            fontWeight: 600,
            px: 1,
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            lineHeight: 1.15,
            fontSize: {
              xs: "2rem",
              md: "3rem",
            },
          }}
        >
          Good Evening,
          <br />
          Ruben 👋
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 700,
            fontSize: 17,
            lineHeight: 1.8,
          }}
        >
          Welcome to <strong>SKUDynamic</strong>, your AI-powered product
          sourcing platform. Generate intelligent inventory recommendations,
          optimize supplier performance, analyze demand trends, and improve
          stock decisions using Gemini AI.
        </Typography>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
        >
          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              px: 4,
              py: 1.4,
              borderRadius: 3,
              fontWeight: 700,
              background:
                "linear-gradient(90deg,#3B82F6,#6366F1)",
              boxShadow:
                "0 8px 25px rgba(59,130,246,.35)",

              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow:
                  "0 15px 35px rgba(59,130,246,.45)",
              },

              transition: ".3s",
            }}
          >
            Generate AI Recommendation
          </Button>

          <Button
            variant="outlined"
            startIcon={<TrendingUpRoundedIcon />}
            sx={{
              borderRadius: 3,
              px: 4,
            }}
          >
            View Analytics
          </Button>
        </Stack>

        <Stack
          direction="row"
          spacing={5}
          useFlexGap
          sx={{
            mt: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              132
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Products Analysed Today
            </Typography>
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={800}>
              97.2%
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              AI Recommendation Accuracy
            </Typography>
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={800}>
              48
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Active Suppliers
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Box
        sx={{
          position: "absolute",
          right: 70,
          top: 45,
          display: {
            xs: "none",
            md: "flex",
          },
          width: 160,
          height: 160,
          borderRadius: "50%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg,#3B82F6,#8B5CF6)",
          boxShadow:
            "0 20px 60px rgba(59,130,246,.45)",
        }}
      >
        <PsychologyRoundedIcon
          sx={{
            fontSize: 70,
            color: "#fff",
          }}
        />
      </Box>
    </Box>
  );
}

export default WelcomeBanner;