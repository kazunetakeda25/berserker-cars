var ps1:GameObject;
var ps2:GameObject;
var ps3:GameObject;
var ps4:GameObject;
var ps5:GameObject;
var ps6:GameObject;
var ps7:GameObject;
var walls:GameObject;
var psAll:GameObject;
var tText:GUIText;
private var ps0:GameObject;
private var psNew:GameObject;

function Start () {
//ToggleVisibility(walls);
//psNew = ps1;
//addRemoveParticles();
}

function Update () {
if(Input.GetKeyDown(KeyCode.Space)||Input.GetKeyDown(KeyCode.Mouse2))
    {
    ToggleVisibility(walls); 
    }
    
    if(Input.GetKeyDown(KeyCode.Mouse0))
    {
    if(psNew == null){
    psNew = ps1;
    ToggleVisibility(psAll);
    }else if(psNew == ps1){
      psNew = ps2;
    }else if(psNew == ps2){
      psNew = ps3;
    }else if(psNew == ps3){
      psNew = ps4;
    }else if(psNew == ps4){
      psNew = ps5;
    }else if(psNew == ps5){
      psNew = ps6;
    }else if(psNew == ps6){
      psNew = ps7;
    }else if(psNew == ps7){
     psNew = null;
     Destroy(ps0);
     ToggleVisibility(psAll);
     tText.text = "Particle System Collection";
    }
    
    if(psNew!=null){
     addRemoveParticles();
    }
    
 
    }
    }
    function addRemoveParticles() {
     Destroy(ps0);
   var psInst:GameObject = Instantiate (psNew)as GameObject;
   ps0 = psInst;
   tText.text = psNew.name;
    }
    function ToggleVisibility(likeMagic:GameObject) {
    if(likeMagic.active){
    likeMagic.SetActiveRecursively(false);
    }else{
    likeMagic.SetActiveRecursively(true);
    }
   
    
   // var renderers = likeMagic.GetComponentsInChildren(ParticleEmitter);
   // for (var r : ParticleEmitter in renderers) {
   //     r.enabled = !r.enabled;
   // }
}