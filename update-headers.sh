#!/bin/bash

# Update all SiteHeader calls to use new simplified format
echo "Updating SiteHeader calls across all pages..."

# Find all tsx files with SiteHeader calls and update them
find app -name "*.tsx" -exec grep -l "SiteHeader" {} \; | while read file; do
    echo "Updating: $file"
    
    # Replace complex SiteHeader calls with simple ones
    sed -i '' 's/searchPlaceholder="[^"]*"[,]*//' "$file"
    sed -i '' 's/currentPage="[^"]*"[,]*//' "$file"  
    sed -i '' 's/pageSubtitle="[^"]*"[,]*//' "$file"
    
    # Clean up any leftover extra spaces and commas
    sed -i '' 's/<SiteHeader[ ]*\n[ ]*\/>/<SiteHeader \/>/' "$file"
    sed -i '' 's/<SiteHeader[ ]*,[ ]*\/>/<SiteHeader \/>/' "$file"
    
done

echo "Header updates complete!"