 Shader "Custom/MapTexture"
{
   Properties
   {
      _Mask ("Culling Mask", 2D) = "white" {}
   }
   SubShader
   {
      Tags {"Queue" = "Background"}
      Blend SrcAlpha OneMinusSrcAlpha
      Lighting Off
      ZWrite On
      ZTest Always
      Alphatest LEqual 0.1
      Pass
      {
         SetTexture [_Mask] {combine texture}
      }
   }
}
