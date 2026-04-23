<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/catalog">
<html>
<head>
  <title>Product Catalog</title>
  <style>
    table { width: 80%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 10px; }
  </style>
</head>

<body>
<h2>Product Catalog</h2>

<table>
  <tr>
    <th>ID</th><th>Name</th><th>Category</th>
    <th>Price</th><th>Stock</th><th>Rating</th>
  </tr>

  <xsl:for-each select="product">
    <tr>
      <td><xsl:value-of select="@id"/></td>
      <td><xsl:value-of select="name"/></td>
      <td><xsl:value-of select="category"/></td>
      <td><xsl:value-of select="price"/></td>
      <td><xsl:value-of select="stock"/></td>
      <td><xsl:value-of select="rating"/></td>
    </tr>
  </xsl:for-each>

</table>

</body>
</html>
</xsl:template>

</xsl:stylesheet>
