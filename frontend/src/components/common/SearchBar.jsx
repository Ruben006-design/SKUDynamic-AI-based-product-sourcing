import {
  Paper,
  InputBase,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

function SearchBar({
  placeholder,
  onSearch,
}) {
  return (
    <Paper
      sx={{
        p: "4px 12px",
        mb: 3,
        display: "flex",
        alignItems: "center",
        borderRadius: 3,
      }}
    >
      <SearchRoundedIcon
        color="action"
      />

      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        onChange={(e) =>
          onSearch(e.target.value)
        }   
      />
    </Paper>
  );
}

export default SearchBar;