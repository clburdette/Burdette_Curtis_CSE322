window.requestAnimationFrame(gameLoop);

function gameLoop(){
  draw();
  window.requestAnimationFrame(gameLoop);
}
