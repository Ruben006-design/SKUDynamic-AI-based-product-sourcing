import {
  Paper,
  InputBase,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

function SearchBar({
  placeholder = "Search records...",
  onSearch,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        px: 1.5,
        py: 0.6,
        display: "flex",
        alignItems: "center",
        borderRadius: 2.2,
        width: { xs: "100%", sm: 320 },
        bgcolor: isDark ? alpha("#1E293B", 0.5) : "#FFFFFF",
        border: `1px solid ${theme.palette.divider}`,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:focus-within": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />

      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          fontSize: "0.85rem",
          color: "text.primary",
          "& ::placeholder": {
            color: "text.disabled",
            opacity: 1,
          },
        }}
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </Paper>
  );
}

export default SearchBar;
