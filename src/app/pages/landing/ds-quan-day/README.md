# DS Quan Day Component

## Overview
The `ds-quan-day` component manages winding operations with two tabs:
1. **New Windings** - Shows windings with `trang_thai = 0`
2. **Completed Windings** - Shows windings with `trang_thai = 1`

## Features
- Authentication required
- User role-based access
- Search and filtering
- Popup integration with existing components
- Responsive design

## Usage
Route: `/ds-quan-day`

## Database Integration
- `tbl_bd_ha` - Low voltage winding
- `tbl_bd_cao` - High voltage winding
- `tbl_bangve` - Drawing information
- `AspNetUsers` - User management
