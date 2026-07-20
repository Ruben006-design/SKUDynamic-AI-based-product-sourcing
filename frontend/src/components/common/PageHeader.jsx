import {
  Box,
  Typography,
  Stack,
} from "@mui/material";

function PageHeader({
  title,
  subtitle,
  icon,
  action,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mb={3}
      flexWrap="wrap"
      spacing={2}
    >
      <Box>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          {icon}

          <Typography
            variant="h4"
            fontWeight={800}
          >
            {title}
          </Typography>
        </Stack>

        <Typography
          color="text.secondary"
          mt={1}
        >
          {subtitle}
        </Typography>
      </Box>

      {/* IMPORTANT */}
      <Box>
        {action}
      </Box>
    </Stack>
  );
}

export default PageHeader;