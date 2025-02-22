<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>
  
  <!-- Root template -->
  <xsl:template match="/">
    <div class="tei-content">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <!-- Handle div elements -->
  <xsl:template match="div">
    <div class="tei-div">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <!-- Handle p elements -->
  <xsl:template match="p">
    <p class="tei-p">
      <xsl:apply-templates/>
    </p>
  </xsl:template>

  <!-- Handle w (word) elements -->
  <xsl:template match="w">
    <span class="tei-w" data-id="{@xml:id}">
      <xsl:value-of select="."/>
    </span>
    <xsl:text> </xsl:text>
  </xsl:template>

  <!-- Handle ref elements with rend attribute -->
  <xsl:template match="ref[@rend]">
    <span class="tei-ref">
      <xsl:attribute name="class">
        <xsl:text>tei-ref tei-rend-</xsl:text>
        <xsl:value-of select="@rend"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <!-- Handle head elements -->
  <xsl:template match="head">
    <h2 class="tei-head">
      <xsl:apply-templates/>
    </h2>
  </xsl:template>

  <!-- Handle figure elements -->
  <xsl:template match="figure">
    <figure class="tei-figure">
      <!-- <img src="{@url}" alt="Figure"/> -->
    </figure>
  </xsl:template>

  <!-- Handle milestone elements -->
  <xsl:template match="milestone">
    <hr class="tei-milestone"/>
  </xsl:template>
</xsl:stylesheet>