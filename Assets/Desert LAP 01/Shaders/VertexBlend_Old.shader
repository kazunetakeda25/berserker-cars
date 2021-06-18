Shader "CactusPack/VertexBlend_Old" {
	Properties {
		_MainTex ("Base (RGBA)", 2D) = "white" {}
		_Layer1("Layer 1 (RGB)", 2D) ="black" {}
		_SelfIllum("Self Illumination", Color) = (0,0,0,0)
		_BlendSoft("Blend Softness", Range(0,0.8)) = 0.1
	}
	SubShader {
		Tags { "RenderType"="Opaque" }
		LOD 200
		
		CGPROGRAM
		#pragma surface surf Lambert vertex:vert

		sampler2D _MainTex;
		sampler2D _Layer1;
		fixed3 _SelfIllum;
		fixed _BlendSoft;

		struct Input {
			fixed2 uv_MainTex;
			fixed3 vertColor;
		};

		void vert(inout appdata_full v, out Input o)
		{
			o.vertColor = v.color;
		}

		void surf (Input IN, inout SurfaceOutput o) {
			
			fixed4 base = tex2D(_MainTex, IN.uv_MainTex);
			fixed3 blend1 = tex2D(_Layer1, IN.uv_MainTex);
			fixed transformed = ((1 - IN.vertColor.g) - base.a)/_BlendSoft;
			
			fixed mask = saturate(transformed);	
			fixed3 finresult = lerp(base, blend1, mask);	

			o.Albedo = finresult.rgb;
			o.Alpha = 1;
			o.Emission = _SelfIllum.rgb * finresult.rgb;			
		}
		ENDCG
	} 
	FallBack "Mobile/VertexLit"
}
